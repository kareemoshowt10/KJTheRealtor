import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { getRankedLibrary } from '@/lib/library';
import { getThisWeekMinutes } from '@/lib/stats';
import { formatMinutes, toDateKey } from '@/lib/dates';
import RankedList from '@/components/RankedList';

const FEATURES = [
  {
    title: 'Every episode, logged',
    body: 'Log each movie and episode as you watch it — season, episode, date, rewatch or not.',
  },
  {
    title: 'Your weekly rhythm',
    body: 'See hours per week, which nights you actually watch, streaks, and where the time goes.',
  },
  {
    title: 'Rankings that move',
    body: 'Scores shift with recency, rewatches, and progress — not frozen at first impression.',
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="animate-fade-in-up py-10 text-center sm:py-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
          Movies + TV, one library
        </p>
        <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Rank what{' '}
          <span className="bg-gradient-to-r from-accent to-amber-300 bg-clip-text text-transparent">
            actually lasts
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-md text-zinc-400">
          Log every movie and episode you watch, then see the pattern — how much, how often,
          and what's really holding your attention.
        </p>
        <div className="mb-14 flex justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Get started
          </Link>
          <Link href="/discover" className="btn-ghost">
            See what's trending
          </Link>
        </div>
        <div className="grid gap-4 text-left sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover p-5">
              <h2 className="mb-1.5 font-semibold text-accent">{f.title}</h2>
              <p className="text-sm leading-relaxed text-zinc-400">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const [entries, thisWeekMinutes] = await Promise.all([
    getRankedLibrary(user.uid),
    getThisWeekMinutes(user.uid, toDateKey(new Date())),
  ]);

  const watching = entries.filter((e) => e.userTitle.status === 'watching');
  const completed = entries.filter((e) => e.userTitle.status === 'completed');

  const stats = [
    { label: 'This week', value: formatMinutes(thisWeekMinutes) },
    { label: 'Watching', value: String(watching.length) },
    { label: 'Completed', value: String(completed.length) },
    { label: 'In library', value: String(entries.length) },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-2xl font-bold text-accent">{s.value}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <h1 className="mb-4 text-xl font-semibold">Currently watching</h1>
      <RankedList entries={watching} />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/search" className="btn-primary">
          Find something to watch
        </Link>
        <Link href="/stats" className="btn-ghost">
          See your watching stats
        </Link>
        <Link href="/rankings" className="btn-ghost">
          View full rankings
        </Link>
      </div>
    </div>
  );
}
