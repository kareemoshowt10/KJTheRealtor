/**
 * Date helpers for watch-behavior bucketing.
 *
 * Everything works on `YYYY-MM-DD` local date keys supplied by the client, so
 * the server never has to guess the viewer's timezone. Keys are parsed at UTC
 * noon before any arithmetic, which keeps DST transitions from shifting a date
 * into the neighbouring day.
 */

const DAY_MS = 86_400_000;

export const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && DATE_KEY_RE.test(value);
}

/** Parse a YYYY-MM-DD key to a Date at UTC noon. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** Format a Date's UTC calendar day as YYYY-MM-DD. */
export function toDateKey(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/**
 * Today's date key in the *runtime's local* timezone.
 * Call this on the client (or from a component that knows the viewer's clock) —
 * on the server it resolves to the host timezone, which is rarely the viewer's.
 */
export function localTodayKey(date: Date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function daysBetween(fromKey: string, toKey: string): number {
  return Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / DAY_MS);
}

/** Monday of the week containing this date key. */
export function weekStartKey(key: string): string {
  const date = parseDateKey(key);
  // getUTCDay: 0=Sun … 6=Sat. Shift so Monday is the week's first day.
  const offset = (date.getUTCDay() + 6) % 7;
  return toDateKey(addDays(date, -offset));
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(key: string): number {
  return parseDateKey(key).getUTCDay();
}

/** Ascending list of week-start keys from `fromKey`'s week through `toKey`'s week. */
export function weekRange(fromKey: string, toKey: string): string[] {
  const keys: string[] = [];
  let cursor = parseDateKey(weekStartKey(fromKey));
  const end = parseDateKey(weekStartKey(toKey));
  while (cursor.getTime() <= end.getTime()) {
    keys.push(toDateKey(cursor));
    cursor = addDays(cursor, 7);
  }
  return keys;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1).replace(/\.0$/, '')}h`;
}
