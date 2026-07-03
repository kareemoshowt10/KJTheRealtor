import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getRankedLibrary } from '@/lib/library';
import RankedList from '@/components/RankedList';

const FEATURES = [
  { title: 'Dynamic rankings', body: 'Scores shift with recency, rewatches, and progress — not frozen at first impression.' },
  { title: 'Score history', body: 'Every re-rating is kept, so you can see how a title aged for you.' },
  { title: 'Taste you trust', body: 'Follow people, debate rankings per title, and earn a trusted-reviewer badge.' },
];

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          Track what you watch, rank what actually lasts, and discuss it with people whose
          taste you trust.
        </p>
        <div className="mb-14 flex justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Get started
          </Link>
          <Link href="/search" className="btn-ghost">
            Browse titles
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

  const entries = await getRankedLibrary(supabase, user.id);
  const watching = entries.filter((e) => e.userTitle.status === 'watching');
  const completed = entries.filter((e) => e.userTitle.status === 'completed');
  const scored = entries.filter((e) => e.dynamicScore !== null);
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, e) => sum + (e.dynamicScore ?? 0), 0) / scored.length
      : null;

  const stats = [
    { label: 'Watching', value: String(watching.length) },
    { label: 'Completed', value: String(completed.length) },
    { label: 'In library', value: String(entries.length) },
    { label: 'Avg score', value: avgScore !== null ? avgScore.toFixed(1) : '—' },
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

      <div className="mt-8 flex gap-3">
        <Link href="/search" className="btn-primary">
          Find something to watch
        </Link>
        <Link href="/rankings" className="btn-ghost">
          View full rankings
        </Link>
      </div>
    </div>
  );
}
