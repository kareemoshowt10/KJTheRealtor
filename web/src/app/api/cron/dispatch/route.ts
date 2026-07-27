/**
 * GET /api/cron/dispatch — the consumer side of the queue.
 *
 * Ch.19 in miniature. Claims a batch with SKIP LOCKED so overlapping cron
 * invocations never double-send, delivers each message, and on failure leaves
 * it pending with exponential backoff (claim_outbox already advanced
 * next_attempt_at) until attempt 5, at which point it is dead-lettered rather
 * than retried forever.
 *
 * Delivery is at-least-once, not exactly-once — if the email sends and then
 * markDone fails, the message is retried and Kareem gets a duplicate. That is
 * the correct trade here: a duplicate lead alert is a minor annoyance, a
 * dropped one is a lost client. Exactly-once would cost a distributed
 * transaction to buy protection against the cheaper failure.
 *
 * Wired to Vercel Cron in vercel.json (every minute).
 */

import { NextResponse } from "next/server";
import { funnelConfigured, rpc } from "@/lib/funnel/db";
import { claim, deliver, markDone, markFailed } from "@/lib/funnel/notify";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // unset in preview/dev
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!funnelConfigured) {
    return NextResponse.json({ skipped: "not_configured" });
  }

  let sent = 0;
  let failed = 0;

  try {
    const batch = await claim(20);

    // Sequential, not Promise.all: the batch is tiny and a burst of parallel
    // sends is the fastest way to trip a provider's own rate limit.
    for (const msg of batch) {
      try {
        await deliver(msg);
        await markDone(msg.id);
        sent++;
      } catch (e) {
        failed++;
        await markFailed(
          msg.id,
          msg.attempts,
          e instanceof Error ? e.message : String(e)
        ).catch(() => {});
      }
    }
  } catch {
    return NextResponse.json({ error: "claim_failed" }, { status: 502 });
  }

  // Housekeeping, cheap enough to run on every tick: expires abandoned slot
  // holds, trims raw events past retention, drops stale rate-limit buckets.
  await rpc("funnel_gc").catch(() => {});

  return NextResponse.json({ sent, failed });
}
