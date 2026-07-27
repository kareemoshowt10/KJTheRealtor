/**
 * GET /api/slots — available appointment inventory.
 *
 * Ch.22 calls this the "search availability" path, and its defining property
 * is that it is *advisory*. What comes back is a snapshot; by the time the
 * visitor picks one, someone else may have taken it. The booking route is
 * where correctness is enforced — never here.
 *
 * Cached for 30s at the edge. Slot inventory changes slowly, this endpoint is
 * hit on every page that renders the booker, and a 30s-stale slot list costs
 * nothing because the booker already has to handle "just taken".
 */

import { NextResponse } from "next/server";
import { select, funnelConfigured } from "@/lib/funnel/db";

export const runtime = "edge";

type Slot = { id: string; starts_at: string; ends_at: string; kind: string };

const TZ = "America/Los_Angeles";

export async function GET(req: Request) {
  if (!funnelConfigured) {
    return NextResponse.json({ slots: [], configured: false });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 14, 1), 60);
  const kind = url.searchParams.get("kind");

  const until = new Date(Date.now() + days * 86_400_000).toISOString();

  const query = [
    `starts_at=lt.${until}`,
    kind ? `kind=eq.${encodeURIComponent(kind)}` : null,
    "order=starts_at.asc",
    "limit=200",
  ]
    .filter(Boolean)
    .join("&");

  try {
    const slots = await select<Slot[]>("open_slots", query);

    const fmtDay = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const fmtTime = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit",
    });

    // Group by local day — the booker renders day columns, and doing the
    // timezone work server-side keeps it consistent for a visitor who is
    // browsing from out of state.
    const byDay = new Map<string, { label: string; times: unknown[] }>();
    for (const s of slots) {
      const d = new Date(s.starts_at);
      const label = fmtDay.format(d);
      if (!byDay.has(label)) byDay.set(label, { label, times: [] });
      byDay.get(label)!.times.push({
        id: s.id,
        kind: s.kind,
        starts_at: s.starts_at,
        time: fmtTime.format(d),
      });
    }

    return NextResponse.json(
      { configured: true, timezone: TZ, days: Array.from(byDay.values()) },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ slots: [], configured: false }, { status: 502 });
  }
}
