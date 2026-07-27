/**
 * Ch.07 — Unique ID Generator.
 *
 * Snowflake's actual insight is not "128 bits of randomness". It is that the
 * ID should be *time-sortable*, so that ordering by ID is ordering by arrival
 * and pagination never needs a secondary index. UUIDv4 throws that away.
 *
 * We don't need Snowflake's datacenter/worker bits — there is one logical
 * writer and a few dozen leads a day, not 10k/sec across a fleet. So: a
 * base36 millisecond timestamp (lexicographically sortable, since the width is
 * stable until the year 5000) plus 8 random chars for collision safety.
 *
 *   lead_mf3k9x2p_a7c2e910
 *   |    |         |
 *   |    |         random suffix
 *   |    base36 ms timestamp -> string sort == chronological sort
 *   prefix -> the ID tells you what it is when you see it in a log
 */

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

function randomSuffix(len = 8): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function newId(prefix: string, at: number = Date.now()): string {
  return `${prefix}_${at.toString(36)}_${randomSuffix()}`;
}

export const newLeadId = () => newId("lead");
export const newBookingId = () => newId("bkg");
export const newVisitorId = () => newId("v");
export const newSessionId = () => newId("s");

/** Recover the mint time from an ID — handy when debugging a log line. */
export function idTime(id: string): Date | null {
  const part = id.split("_")[1];
  const ms = part ? parseInt(part, 36) : NaN;
  return Number.isFinite(ms) ? new Date(ms) : null;
}

/**
 * Dedupe fingerprint for lead submissions.
 *
 * Same person + same contact detail inside the same 10-minute bucket is one
 * lead, however many times the button was tapped. Bucketing by time rather
 * than using a client-supplied key means a bot replaying the payload an hour
 * later still creates a distinct row you can inspect, while a human
 * double-tapping creates one.
 */
export async function leadFingerprint(input: {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  at?: number;
}): Promise<string> {
  const bucket = Math.floor((input.at ?? Date.now()) / (10 * 60 * 1000));
  const identity =
    (input.email || "").trim().toLowerCase() ||
    (input.phone || "").replace(/\D/g, "") ||
    (input.name || "").trim().toLowerCase();

  const data = new TextEncoder().encode(`${identity}:${bucket}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
