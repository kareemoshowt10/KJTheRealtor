/**
 * Ch.04 — Rate Limiter (token bucket).
 *
 * Token bucket rather than fixed window because the traffic we care about is
 * bursty in a legitimate way: a guide page hits the front of a subreddit and
 * fifty real people submit within a minute. A fixed window rejects the tail of
 * that burst; a bucket with a decent capacity absorbs it and only bites when
 * the *sustained* rate is inhuman.
 *
 * State lives in Postgres (see consume_token in 0001_funnel.sql). An in-memory
 * counter would limit one lambda instance, not one visitor — serverless routes
 * are horizontally scaled, so the naive version leaks by exactly the number of
 * concurrent instances.
 *
 * FAIL OPEN. If the limiter itself is down we let the request through. A lost
 * lead costs Kareem a commission; a spam lead costs him ten seconds. The
 * asymmetry decides the default.
 */

import { rpc } from "./db";

export type Limit = { capacity: number; refillPerSecond: number };

export const LIMITS = {
  /** Lead submits: 5 in a burst, then one per 30s sustained. */
  lead: { capacity: 5, refillPerSecond: 1 / 30 },
  /** Bookings: tighter — a real person books once. */
  book: { capacity: 3, refillPerSecond: 1 / 60 },
  /** Event beacons: generous, this is normal page traffic. */
  events: { capacity: 120, refillPerSecond: 2 },
} satisfies Record<string, Limit>;

export async function allow(
  scope: keyof typeof LIMITS,
  key: string,
  cost = 1
): Promise<boolean> {
  const limit = LIMITS[scope];
  try {
    return await rpc<boolean>("consume_token", {
      p_bucket: `${scope}:${key}`,
      p_capacity: limit.capacity,
      p_refill: limit.refillPerSecond,
      p_cost: cost,
    });
  } catch {
    return true; // fail open — see note above
  }
}

/**
 * Best-effort client identity for bucketing.
 *
 * Vercel sets x-forwarded-for; the leftmost entry is the client. This is
 * spoofable, which is fine — the limiter is a cost control and a spam speed
 * bump, not an authentication boundary.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim();
  return ip || req.headers.get("x-real-ip") || "unknown";
}
