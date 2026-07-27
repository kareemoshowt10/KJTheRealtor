/**
 * Server-side Supabase access.
 *
 * Deliberately a thin fetch wrapper over PostgREST rather than
 * @supabase/supabase-js: these routes do a handful of inserts and one RPC
 * each, and this keeps the edge bundle small and the failure modes obvious.
 *
 * SERVICE_ROLE_KEY bypasses RLS. It must never reach the browser — every
 * caller in this directory is a server route.
 */

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const funnelConfigured = Boolean(URL_ && KEY);

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

class DbError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "DbError";
  }
}

/** Postgres unique-violation. The booking route depends on spotting this. */
export const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(e: unknown): boolean {
  return e instanceof DbError && e.code === UNIQUE_VIOLATION;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!funnelConfigured) throw new DbError("funnel db not configured", 503);

  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: headers((init.headers as Record<string, string>) || {}),
    cache: "no-store",
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new DbError(
      body?.message || `db request failed (${res.status})`,
      res.status,
      body?.code
    );
  }
  return body as T;
}

export function insert<T>(
  table: string,
  rows: unknown,
  opts: { returning?: boolean; onConflict?: string; ignoreDuplicates?: boolean } = {}
): Promise<T> {
  const prefer = [
    opts.returning === false ? "return=minimal" : "return=representation",
    opts.ignoreDuplicates ? "resolution=ignore-duplicates" : null,
  ]
    .filter(Boolean)
    .join(",");

  const qs = opts.onConflict ? `?on_conflict=${opts.onConflict}` : "";
  return request<T>(`${table}${qs}`, {
    method: "POST",
    headers: { Prefer: prefer },
    body: JSON.stringify(rows),
  });
}

export function select<T>(table: string, query: string): Promise<T> {
  return request<T>(`${table}?${query}`, { method: "GET" });
}

export function patch<T>(table: string, query: string, values: unknown): Promise<T> {
  return request<T>(`${table}?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(values),
  });
}

export function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  return request<T>(`rpc/${fn}`, {
    method: "POST",
    body: JSON.stringify(args),
  });
}
