import { getAdminDb } from './firebase/admin';
import { getDocsByIds } from './firestore-helpers';
import { toDateKey, weekStartKey, weekRange, addDays, parseDateKey } from './dates';
import type {
  DayBucket,
  Title,
  TopTitle,
  WatchEvent,
  WatchEventWithTitle,
  WatchStats,
  WeekBucket,
} from './types';

/** How many weeks the cadence chart shows. */
export const CADENCE_WEEKS = 26;
const RECENT_LIMIT = 20;
const TOP_TITLES_LIMIT = 6;

function emptyStats(): WatchStats {
  return {
    totalMinutes: 0,
    episodeCount: 0,
    movieCount: 0,
    activeDays: 0,
    currentStreakWeeks: 0,
    longestStreakWeeks: 0,
    avgMinutesPerWeek: 0,
    thisWeekMinutes: 0,
    lastWeekMinutes: 0,
    weeks: [],
    days: Array.from({ length: 7 }, (_, weekday) => ({ weekday, tvMinutes: 0, movieMinutes: 0 })),
    topTitles: [],
    recent: [],
  };
}

/**
 * Build the full behavior picture from the raw watch log.
 *
 * `todayKey` comes from the caller (the viewer's local date) so "this week" and
 * the streak are measured against the user's calendar, not the server's.
 */
export async function getWatchStats(userId: string, todayKey: string): Promise<WatchStats> {
  const db = getAdminDb();

  const snap = await db.collection('watchEvents').where('user_id', '==', userId).get();
  if (snap.empty) return emptyStats();

  const events = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as object) }) as WatchEvent)
    .sort((a, b) => b.watched_at.localeCompare(a.watched_at));

  const titleMap = await getDocsByIds<Title>(
    db,
    'titles',
    events.map((e) => e.title_id)
  );

  const stats = emptyStats();
  const weekMap = new Map<string, WeekBucket>();
  const activeDates = new Set<string>();
  const minutesByTitle = new Map<string, { minutes: number; plays: number }>();

  let earliestDate = events[0].watched_date;

  for (const event of events) {
    const isTv = event.media_type === 'tv';
    stats.totalMinutes += event.runtime_minutes;
    if (isTv) stats.episodeCount++;
    else stats.movieCount++;

    activeDates.add(event.watched_date);
    if (event.watched_date < earliestDate) earliestDate = event.watched_date;

    const wk = weekStartKey(event.watched_date);
    const bucket = weekMap.get(wk) ?? {
      weekStart: wk,
      tvMinutes: 0,
      movieMinutes: 0,
      episodes: 0,
      movies: 0,
    };
    if (isTv) {
      bucket.tvMinutes += event.runtime_minutes;
      bucket.episodes++;
    } else {
      bucket.movieMinutes += event.runtime_minutes;
      bucket.movies++;
    }
    weekMap.set(wk, bucket);

    const day = stats.days[parseDateKey(event.watched_date).getUTCDay()];
    if (isTv) day.tvMinutes += event.runtime_minutes;
    else day.movieMinutes += event.runtime_minutes;

    const agg = minutesByTitle.get(event.title_id) ?? { minutes: 0, plays: 0 };
    agg.minutes += event.runtime_minutes;
    agg.plays++;
    minutesByTitle.set(event.title_id, agg);
  }

  stats.activeDays = activeDates.size;

  // Dense week series — weeks with nothing watched must still appear as zeros,
  // otherwise the cadence chart silently closes the gaps and overstates consistency.
  const allWeeks = weekRange(earliestDate, todayKey);
  const dense = allWeeks.map(
    (weekStart) =>
      weekMap.get(weekStart) ?? {
        weekStart,
        tvMinutes: 0,
        movieMinutes: 0,
        episodes: 0,
        movies: 0,
      }
  );

  stats.weeks = dense.slice(-CADENCE_WEEKS);

  const totalWeeks = Math.max(dense.length, 1);
  stats.avgMinutesPerWeek = stats.totalMinutes / totalWeeks;

  const thisWeek = weekStartKey(todayKey);
  const lastWeek = toDateKey(addDays(parseDateKey(thisWeek), -7));
  const minutesOf = (b?: WeekBucket) => (b ? b.tvMinutes + b.movieMinutes : 0);
  stats.thisWeekMinutes = minutesOf(weekMap.get(thisWeek));
  stats.lastWeekMinutes = minutesOf(weekMap.get(lastWeek));

  // Current streak: consecutive active weeks counting back. An empty current week
  // doesn't break it yet — the week is still in progress, so start from last week.
  let cursor = weekMap.has(thisWeek) ? thisWeek : lastWeek;
  while (weekMap.has(cursor)) {
    stats.currentStreakWeeks++;
    cursor = toDateKey(addDays(parseDateKey(cursor), -7));
  }

  let run = 0;
  for (const bucket of dense) {
    run = weekMap.has(bucket.weekStart) ? run + 1 : 0;
    if (run > stats.longestStreakWeeks) stats.longestStreakWeeks = run;
  }

  stats.topTitles = [...minutesByTitle.entries()]
    .map(([titleId, agg]) => {
      const title = titleMap.get(titleId);
      return title ? ({ title, minutes: agg.minutes, plays: agg.plays } as TopTitle) : null;
    })
    .filter((t): t is TopTitle => t !== null)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, TOP_TITLES_LIMIT);

  stats.recent = events
    .slice(0, RECENT_LIMIT)
    .map((event) => {
      const title = titleMap.get(event.title_id);
      return title ? ({ event, title } as WatchEventWithTitle) : null;
    })
    .filter((e): e is WatchEventWithTitle => e !== null);

  return stats;
}

/** Minutes watched in the viewer's current week — used by the dashboard tiles. */
export async function getThisWeekMinutes(userId: string, todayKey: string): Promise<number> {
  const db = getAdminDb();
  const weekStart = weekStartKey(todayKey);

  const snap = await db
    .collection('watchEvents')
    .where('user_id', '==', userId)
    .where('watched_date', '>=', weekStart)
    .get();

  return snap.docs.reduce((sum, d) => sum + ((d.data() as WatchEvent).runtime_minutes ?? 0), 0);
}
