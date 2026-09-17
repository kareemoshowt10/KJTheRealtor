import Image from 'next/image';
import Link from 'next/link';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { RankedEntry } from '@/lib/types';

const RANK_COLORS = ['text-amber-400', 'text-zinc-300', 'text-amber-700'];

export default function RankedList({ entries }: { entries: RankedEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-zinc-400">
        Nothing tracked yet.{' '}
        <Link href="/search" className="text-accent underline">
          Find something to watch.
        </Link>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry, i) => {
        const poster = tmdbPosterUrl(entry.title.poster_path);
        const rankColor = RANK_COLORS[i] ?? 'text-zinc-500';
        const { current_season: season, current_episode: episode } = entry.userTitle;
        return (
          <li
            key={entry.userTitle.id}
            className="card card-hover flex items-center gap-4 p-3"
          >
            <span className={`w-7 text-right text-sm font-bold ${rankColor}`}>{i + 1}</span>
            {poster ? (
              <Image
                src={poster}
                alt={entry.title.name}
                width={40}
                height={60}
                className="rounded-md"
              />
            ) : (
              <div className="h-[60px] w-10 rounded-md bg-zinc-800" />
            )}
            <div className="flex-1">
              <Link
                href={`/title/${entry.title.media_type}/${entry.title.tmdb_id}`}
                className="font-medium hover:text-accent"
              >
                {entry.title.name}
              </Link>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {entry.title.media_type} · {entry.userTitle.status}
                {entry.title.media_type === 'tv' && season != null && episode != null && (
                  <span className="ml-1.5 rounded bg-accent/15 px-1.5 py-0.5 font-semibold normal-case text-accent">
                    S{season} · E{episode}
                  </span>
                )}
              </p>
            </div>
            <span className="score-badge">
              {entry.dynamicScore !== null ? entry.dynamicScore.toFixed(1) : '—'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
