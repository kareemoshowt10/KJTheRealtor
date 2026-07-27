/**
 * POST /api/lead — the capture path.
 *
 * Shape of the request, in the order the chapters put them:
 *   1. Ch.04  rate limit by IP (fail open)
 *   2.        honeypot + validation
 *   3. Ch.07  mint a time-sortable lead id, compute a dedupe fingerprint
 *   4.        persist — this is the durable point, everything after is best-effort
 *   5. Ch.19  enqueue the alert in the same transaction-ish moment
 *   6.        return 202 immediately; delivery happens in /api/cron/dispatch
 *
 * Step 6 is the whole point. The visitor's spinner is bounded by one Postgres
 * insert, not by whether an email provider is having a bad afternoon.
 */

import { NextResponse, after } from "next/server";
import { insert, funnelConfigured, isUniqueViolation } from "@/lib/funnel/db";
import { newLeadId, leadFingerprint } from "@/lib/funnel/ids";
import { allow, clientKey } from "@/lib/funnel/ratelimit";
import { enqueue, kickDispatch } from "@/lib/funnel/notify";

export const runtime = "edge";

const str = (v: FormDataEntryValue | undefined | null, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

async function readBody(req: Request): Promise<Record<string, string>> {
  const type = req.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const raw = (await req.json()) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, str(v as string)])
    );
  }
  const fd = await req.formData();
  return Object.fromEntries(
    Array.from(fd.entries()).map(([k, v]) => [k, str(v)])
  );
}

export async function POST(req: Request) {
  if (!funnelConfigured) {
    // No DB wired up yet — tell the client so it falls back to Formspree
    // rather than silently dropping a real lead on the floor.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let b: Record<string, string>;
  try {
    b = await readBody(req);
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Return success so they stop retrying.
  if (b._gotcha) {
    return NextResponse.json({ ok: true, lead_id: newLeadId() }, { status: 202 });
  }

  if (!(await allow("lead", clientKey(req)))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = str(b.name, 120);
  const email = str(b.email, 200);
  const phone = str(b.phone, 40);

  if (!name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ error: "contact_required" }, { status: 400 });
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }

  const id = newLeadId();
  const fingerprint = await leadFingerprint({ email, phone, name });

  const row = {
    id,
    name,
    email: email || null,
    phone: phone || null,
    message: str(b.message, 4000) || null,
    intent: str(b.intent || b.topic_chip || b.goal || b.lead_path, 200) || null,
    consent: b.consent ? true : false,

    source: str(b.source, 120) || null,
    page_path: str(b.page_path || b.submitted_from, 300) || null,
    visitor_id: str(b.visitor_id, 60) || null,
    session_id: str(b.session_id, 60) || null,

    lead_source: str(b.lead_source, 200) || null,
    first_touch_source: str(b.first_touch_source, 200) || null,
    utm_source: str(b.utm_source, 120) || null,
    utm_medium: str(b.utm_medium, 120) || null,
    utm_campaign: str(b.utm_campaign, 120) || null,
    utm_term: str(b.utm_term, 120) || null,
    utm_content: str(b.utm_content, 120) || null,
    gclid: str(b.gclid, 200) || null,
    fbclid: str(b.fbclid, 200) || null,
    referrer: str(b.referrer, 300) || null,
    landing_page: str(b.landing_page, 300) || null,

    fingerprint,
  };

  try {
    const created = await insert<{ id: string }[]>("leads", row, {
      onConflict: "fingerprint",
      ignoreDuplicates: true,
    });

    // Empty array => the fingerprint already existed. It's a duplicate submit,
    // so we answer success (the lead IS captured) but skip the second alert.
    const isDuplicate = !created || created.length === 0;

    if (!isDuplicate) {
      await enqueue("lead.alert", { ...row, lead_id: id }, `lead:${id}`);
      // after() runs once the response is on the wire, so the visitor never
      // waits on delivery — but the alert still goes out in seconds rather
      // than on the next cron tick.
      after(() => kickDispatch());
    }

    return NextResponse.json(
      { ok: true, lead_id: isDuplicate ? null : id, duplicate: isDuplicate },
      { status: 202 }
    );
  } catch (e) {
    if (isUniqueViolation(e)) {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 202 });
    }
    // Surface the failure so the client falls back to Formspree. Losing the
    // lead is the only genuinely unacceptable outcome here.
    return NextResponse.json({ error: "capture_failed" }, { status: 502 });
  }
}
