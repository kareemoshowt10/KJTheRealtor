/**
 * POST /api/book — Ch.22, Hotel Reservation System.
 *
 * The chapter's central problem is the one every booking system gets wrong on
 * the first try: two people click the same slot at the same moment. The naive
 * fix — SELECT to check availability, then INSERT — is a textbook race. Both
 * requests read "free", both insert, one visitor shows up to an appointment
 * that was given away.
 *
 * The fix is not a lock in application code. It is this, in 0001_funnel.sql:
 *
 *     create unique index bookings_one_active_per_slot
 *       on bookings (slot_id) where status in ('pending','confirmed');
 *
 * Both requests still race. The database serialises them, exactly one insert
 * survives, and the loser gets a unique-violation that this route translates
 * into an honest "that time was just taken". Correctness lives in the
 * constraint; this file just has to not swallow the error.
 *
 * Second idea from the chapter: idempotency. A double-tapped Confirm, or a
 * retry after the response was lost in flight, must not produce two
 * appointments. The client mints a key once per booking attempt and reuses it
 * across retries; bookings.idempotency_key is unique.
 */

import { NextResponse, after } from "next/server";
import { insert, select, funnelConfigured, isUniqueViolation } from "@/lib/funnel/db";
import { newBookingId, newLeadId, leadFingerprint } from "@/lib/funnel/ids";
import { allow, clientKey } from "@/lib/funnel/ratelimit";
import { enqueue, kickDispatch } from "@/lib/funnel/notify";

export const runtime = "edge";

const TZ = "America/Los_Angeles";

const str = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  if (!funnelConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (str(b._gotcha)) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  if (!(await allow("book", clientKey(req)))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const slotId = str(b.slot_id, 60);
  const name = str(b.name, 120);
  const phone = str(b.phone, 40);
  const email = str(b.email, 200);
  const idempotencyKey =
    str(b.idempotency_key, 100) || req.headers.get("idempotency-key") || "";

  if (!slotId) return NextResponse.json({ error: "slot_required" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "phone_required" }, { status: 400 });
  }

  // Retry of a request we already completed? Return the original booking.
  // This is checked before inserting so a retry is cheap, but it is NOT the
  // safety mechanism — the unique index is. This is just a nicety.
  if (idempotencyKey) {
    try {
      const existing = await select<{ id: string; slot_id: string }[]>(
        "bookings",
        `idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=id,slot_id&limit=1`
      );
      if (existing?.length) {
        return NextResponse.json(
          { ok: true, booking_id: existing[0].id, replayed: true },
          { status: 200 }
        );
      }
    } catch {
      /* fall through and let the constraint decide */
    }
  }

  // Fetch the slot so we can put a human-readable time in the alert, and so a
  // request naming a slot that doesn't exist fails cleanly.
  let slot: { id: string; starts_at: string; kind: string } | undefined;
  try {
    const rows = await select<{ id: string; starts_at: string; kind: string }[]>(
      "slots",
      `id=eq.${encodeURIComponent(slotId)}&is_open=is.true&select=id,starts_at,kind&limit=1`
    );
    slot = rows?.[0];
  } catch {
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }

  if (!slot) return NextResponse.json({ error: "slot_unknown" }, { status: 404 });
  if (new Date(slot.starts_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "slot_past" }, { status: 409 });
  }

  // A booking is the strongest lead signal on the site, so it becomes a lead
  // row too — otherwise your funnel data has a hole exactly where it converts.
  let leadId: string | null = newLeadId();
  try {
    const created = await insert<{ id: string }[]>(
      "leads",
      {
        id: leadId,
        name,
        email: email || null,
        phone,
        message: str(b.notes, 2000) || null,
        intent: str(b.topic, 200) || "Booked appointment",
        consent: true,
        source: "booking",
        page_path: str(b.page_path, 300) || null,
        visitor_id: str(b.visitor_id, 60) || null,
        session_id: str(b.session_id, 60) || null,
        lead_source: str(b.lead_source, 200) || null,
        first_touch_source: str(b.first_touch_source, 200) || null,
        utm_campaign: str(b.utm_campaign, 120) || null,
        landing_page: str(b.landing_page, 300) || null,
        fingerprint: await leadFingerprint({ email, phone, name }),
        status: "booked",
      },
      { onConflict: "fingerprint", ignoreDuplicates: true }
    );
    if (!created || created.length === 0) leadId = null; // already a known lead
  } catch {
    leadId = null; // never block a booking on lead bookkeeping
  }

  const bookingId = newBookingId();

  try {
    await insert(
      "bookings",
      {
        id: bookingId,
        slot_id: slotId,
        lead_id: leadId,
        name,
        email: email || null,
        phone,
        topic: str(b.topic, 200) || null,
        notes: str(b.notes, 2000) || null,
        status: "confirmed",
        idempotency_key: idempotencyKey || null,
      },
      { returning: false }
    );
  } catch (e) {
    if (isUniqueViolation(e)) {
      // Lost the race, or a replay we didn't catch above. Either way the
      // honest answer is the same, and the client re-fetches the slot list.
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "booking_failed" }, { status: 502 });
  }

  const whenLocal = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(slot.starts_at));

  await enqueue(
    "booking.alert",
    {
      booking_id: bookingId,
      name,
      phone,
      email,
      topic_text: str(b.topic, 200),
      notes: str(b.notes, 2000),
      kind: slot.kind,
      when_local: whenLocal,
      lead_source: str(b.lead_source, 200),
    },
    `booking:${bookingId}`
  ).catch(() => {});

  after(() => kickDispatch());

  return NextResponse.json(
    { ok: true, booking_id: bookingId, when: whenLocal, timezone: TZ },
    { status: 201 }
  );
}
