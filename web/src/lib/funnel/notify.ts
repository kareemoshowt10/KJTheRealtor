/**
 * Ch.10 — Notification System (+ Ch.19, the queue underneath it).
 *
 * The rule the chapter is really teaching: the visitor's request must not be
 * coupled to the delivery of your alert. If Resend is slow, the form spinner
 * should not be slow. If Resend is down, the lead must still be captured.
 *
 * So the write path is: persist the lead -> enqueue an alert -> return 202.
 * Delivery happens out of band, with retries and a dead-letter state, driven
 * by /api/cron/dispatch.
 */

import { insert, patch, rpc } from "./db";

export type OutboxRow = {
  id: number;
  topic: string;
  payload: Record<string, unknown>;
  attempts: number;
};

/**
 * Enqueue an alert. `dedupeKey` is what stops a retried lead insert from
 * producing two emails — the unique constraint on outbox.dedupe_key absorbs it.
 */
export async function enqueue(
  topic: string,
  payload: Record<string, unknown>,
  dedupeKey?: string
): Promise<void> {
  await insert(
    "outbox",
    { topic, payload, dedupe_key: dedupeKey ?? null },
    { returning: false, onConflict: "dedupe_key", ignoreDuplicates: true }
  );
}

export const claim = (batchSize = 10) =>
  rpc<OutboxRow[]>("claim_outbox", { batch_size: batchSize });

/**
 * Drain the queue eagerly, right after enqueueing.
 *
 * Cron alone would work, but Vercel's Hobby plan only permits daily crons —
 * a lead alert arriving up to 24 hours late is useless. So the cron becomes a
 * *backstop* for anything that failed, and the normal path is this: the
 * capture route enqueues, responds to the visitor, and then (via `after()`,
 * so it runs outside the response lifecycle) pokes the dispatcher.
 *
 * Fire-and-forget on purpose. If the poke fails the message is still sitting
 * in the outbox and the cron will pick it up — that's the entire point of
 * writing it down first.
 */
export function kickDispatch(): void {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!base) return;

  const headers: Record<string, string> = {};
  if (process.env.CRON_SECRET) {
    headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;
  }

  fetch(`${base}/api/cron/dispatch`, { headers, cache: "no-store" }).catch(
    () => {}
  );
}

export const markDone = (id: number) =>
  patch("outbox", `id=eq.${id}`, { status: "done", last_error: null });

/** Give up after 5 attempts (~2 hours of exponential backoff). */
export const markFailed = (id: number, attempts: number, error: string) =>
  patch("outbox", `id=eq.${id}`, {
    status: attempts >= 5 ? "dead" : "pending",
    last_error: error.slice(0, 500),
  });

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

const RESEND_KEY = process.env.RESEND_API_KEY;
const ALERT_FROM = process.env.LEAD_ALERT_FROM || "leads@kareemjamaltherealtor.com";
const ALERT_TO = (process.env.LEAD_ALERT_TO || "kjamal@rodeore.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function sendEmail(subject: string, html: string): Promise<void> {
  if (!RESEND_KEY) throw new Error("RESEND_API_KEY not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: ALERT_FROM, to: ALERT_TO, subject, html }),
  });

  if (!res.ok) {
    throw new Error(`resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function table(rows: [string, unknown][]): string {
  const body = rows
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#8a8073;font:600 12px system-ui;text-transform:uppercase;letter-spacing:.06em;vertical-align:top">${esc(
          k
        )}</td><td style="padding:6px 0;color:#2a2520;font:400 15px system-ui">${esc(
          v
        )}</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse">${body}</table>`;
}

/**
 * The point of a custom alert rather than Formspree's raw field dump: it is
 * scannable on a phone in ten seconds, and it leads with the two things that
 * decide whether Kareem calls back right now — who, and how hot.
 */
export async function deliver(msg: OutboxRow): Promise<void> {
  const p = msg.payload as Record<string, string>;

  if (msg.topic === "lead.alert") {
    await sendEmail(
      `🔔 New lead — ${p.name || "unknown"}${p.intent ? ` · ${p.intent}` : ""}`,
      `<div style="max-width:560px;font-family:system-ui,-apple-system,sans-serif">
         <h2 style="margin:0 0 4px;font:600 20px system-ui;color:#2a2520">${esc(
           p.name
         )}</h2>
         <p style="margin:0 0 18px;color:#8a8073;font:400 14px system-ui">
           ${esc(p.lead_source || "direct")} · ${esc(p.page_path || "/")}
         </p>
         ${
           p.phone
             ? `<p style="margin:0 0 18px"><a href="tel:${esc(
                 p.phone
               )}" style="display:inline-block;background:#b88b52;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font:600 15px system-ui">Call ${esc(
                 p.phone
               )}</a></p>`
             : ""
         }
         ${table([
           ["Email", p.email],
           ["Phone", p.phone],
           ["Intent", p.intent],
           ["Message", p.message],
           ["First touch", p.first_touch_source],
           ["Campaign", p.utm_campaign],
           ["Landing page", p.landing_page],
           ["Lead ID", p.lead_id],
         ])}
       </div>`
    );
    return;
  }

  if (msg.topic === "booking.alert") {
    await sendEmail(
      `📅 Appointment booked — ${p.name} · ${p.when_local}`,
      `<div style="max-width:560px;font-family:system-ui,-apple-system,sans-serif">
         <h2 style="margin:0 0 4px;font:600 20px system-ui;color:#2a2520">${esc(
           p.when_local
         )}</h2>
         <p style="margin:0 0 18px;color:#8a8073;font:400 14px system-ui">${esc(
           p.kind
         )} · booked ${esc(p.lead_source || "direct")}</p>
         ${table([
           ["Name", p.name],
           ["Phone", p.phone],
           ["Email", p.email],
           ["Topic", p.topic_text],
           ["Notes", p.notes],
           ["Booking ID", p.booking_id],
         ])}
       </div>`
    );
    return;
  }

  throw new Error(`unknown topic: ${msg.topic}`);
}
