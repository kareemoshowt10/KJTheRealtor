import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { getWatchStats } from '@/lib/stats';
import { formatMinutes, toDateKey } from '@/lib/dates';
import WeeklyCadenceChart from '@/components/charts/WeeklyCadenceChart';
import WeekdayChart from '@/components/charts/WeekdayChart';
import TopTitlesChart from '@/components/charts/TopTitlesChart';
import RecentWatchLog from '@/components/RecentWatchLog';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Server-side "today" is UTC; individual events carry the viewer's own local
  // date, so only the current-week boundary can drift, and only near midnight.
  const stats = await getWatchStats(user.uid, toDateKey(new Date()));

  const delta = stats.thisWeekMinutes - stats.lastWeekMinutes;
  const hasHistory = stats.episodeCount + stats.movieCount > 0;

  const tiles = [
    { label: 'Total watched', value: formatMinutes(stats.totalMinutes) },
    { label: 'Episodes', value: String(stats.episodeCount) },
    { label: 'Movies', value: String(stats.movieCount) },
    { label: 'Weekly average', value: formatMinutes(stats.avgMinutesPerWeek) },
    {
      label: 'Current streak',
      value: `${stats.currentStreakWeeks} wk${stats.currentStreakWeeks === 1 ? '' : 's'}`,
    },
    { label: 'Days watched', value: String(stats.activeDays) },
  ];

  return (
    <div className="animate-fade-in-up">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Your watching</h1>
      <p className="mb-6 text-sm text-zinc-400">
        How much you watch, when you watch it, and what's eating your evenings.
      </p>

      {!hasHistory ? (
        <div className="card p-8 text-center">
          <p className="mb-2 font-semibold">No watches logged yet</p>
          <p className="mx-auto mb-5 max-w-sm text-sm text-zinc-400">
            Open anything in your library and hit “Log a watch”. Log a few and this page fills
            in with your weekly rhythm, streaks, and where your hours actually go.
          </p>
          <Link href="/search" className="btn-primary">
            Find something you've watched
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">This week</p>
              <p className="text-5xl font-semibold leading-tight">
                {formatMinutes(stats.thisWeekMinutes)}
              </p>
              <p className="mt-1 text-sm">
                {delta === 0 ? (
                  <span className="text-zinc-500">Same as last week</span>
                ) : delta > 0 ? (
                  <span className="text-[#0ca30c]">
                    ▲ {formatMinutes(delta)} vs last week
                  </span>
                ) : (
                  <span className="text-zinc-400">
                    ▼ {formatMinutes(Math.abs(delta))} vs last week
                  </span>
                )}
              </p>
            </div>
            {stats.longestStreakWeeks > 1 && (
              <p className="text-sm text-zinc-500">
                Longest streak:{' '}
                <span className="text-zinc-300">{stats.longestStreakWeeks} weeks</span>
              </p>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {tiles.map((t) => (
              <div key={t.label} className="card p-3">
                <p className="text-xl font-semibold">{t.value}</p>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">{t.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <WeeklyCadenceChart weeks={stats.weeks} />
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <WeekdayChart days={stats.days} />
            <TopTitlesChart titles={stats.topTitles} />
          </div>

          <RecentWatchLog entries={stats.recent} />
        </>
      )}
    </div>
  );
}
