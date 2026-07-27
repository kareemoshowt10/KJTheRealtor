/**
 * POST /api/events — Ch.21, Ad Click Event Aggregation.
 *
 * The chapter's problem is "millions of clicks per second, aggregate them
 * without losing any". Ours is "a few thousand page events a day, tell me
 * which of 36 guide pages produces appointments". Same shape, four orders of
 * magnitude apart — so we keep the ideas and drop the infrastructure:
 *
 *   kept    : client-side batching, one write per batch not per event,
 *             raw append-only store + periodic rollup, late events tolerated
 *   dropped : Kafka, Flink, a lambda architecture, exactly-once semantics
 *
 * Called via navigator.sendBeacon on pagehide, so it must be cheap and must
 * never respond with anything the browser waits on.
 */

import { NextResponse } from "next/server";
import { insert, funnelConfigured } from "@/lib/funnel/db";
import { allow, clientKey } from "@/lib/funnel/ratelimit";

export const runtime = "edge";

const MAX_BATCH = 50;

type Incoming = {
  event?: string;
  ts?: number;
  page_path?: string;
  props?: Record<string, unknown>;
};

const clip = (v: unknown, n: number) =>
  typeof v === "string" ? v.slice(0, n) : null;

export async function POST(req: Request) {
  // Beacons are fire-and-forget: a 204 on every path means a misconfigured
  // deploy never shows the visitor a console full of red.
  if (!funnelConfigured) return new NextResponse(null, { status: 204 });

  let body: {
    visitor_id?: string;
    session_id?: string;
    lead_source?: string;
    events?: Incoming[];
  };

  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, MAX_BATCH) : [];
  if (events.length === 0) return new NextResponse(null, { status: 204 });

  // One token per event in the batch, so batching isn't a way to dodge the limit.
  if (!(await allow("events", clientKey(req), events.length))) {
    return new NextResponse(null, { status: 204 });
  }

  const visitor_id = clip(body.visitor_id, 60);
  const session_id = clip(body.session_id, 60);
  const lead_source = clip(body.lead_source, 200);

  const rows = events
    .filter((e) => typeof e.event === "string" && e.event.length > 0)
    .map((e) => ({
      // Client supplies the timestamp: events are buffered and may be sent
      // minutes after they happened. Trusting server time would smear a whole
      // session onto the moment the tab closed.
      ts: new Date(
        typeof e.ts === "number" && e.ts > 0 ? e.ts : Date.now()
      ).toISOString(),
      event: (e.event as string).slice(0, 80),
      visitor_id,
      session_id,
      page_path: clip(e.page_path, 300),
      lead_source,
      props: e.props && typeof e.props === "object" ? e.props : {},
    }));

  if (rows.length === 0) return new NextResponse(null, { status: 204 });

  try {
    await insert("funnel_events", rows, { returning: false });
  } catch {
    // Analytics loss is acceptable; breaking the page is not.
  }

  return new NextResponse(null, { status: 204 });
}
