/**
 * GET /api/cron/rollup — Ch.21's aggregation step.
 *
 * Rolls raw funnel_events into funnel_daily. Runs nightly, and deliberately
 * re-processes *both* yesterday and the day before: beacons from a tab that
 * stayed open across midnight arrive late, and rollup_funnel is idempotent, so
 * recomputing is cheaper than reasoning about watermarks.
 *
 * This is the "batch layer" the chapter describes. We skip the streaming layer
 * entirely — nobody needs sub-minute funnel numbers for a solo agent's site,
 * and the raw table is queryable directly when you want live figures.
 */

import { NextResponse } from "next/server";
import { funnelConfigured, rpc } from "@/lib/funnel/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return (req.headers.get("authorization") || "") === `Bearer ${secret}`;
}

function isoDay(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!funnelConfigured) {
    return NextResponse.json({ skipped: "not_configured" });
  }

  const days = [isoDay(-1), isoDay(-2)];
  const results: Record<string, unknown> = {};

  for (const day of days) {
    try {
      results[day] = await rpc<number>("rollup_funnel", { target_day: day });
    } catch (e) {
      results[day] = `failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({ rolled: results });
}
