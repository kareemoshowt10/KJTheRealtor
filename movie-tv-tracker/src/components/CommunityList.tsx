import Image from 'next/image';
import Link from 'next/link';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { CommunityEntry } from '@/lib/types';

const RANK_COLORS = ['text-amber-400', 'text-zinc-300', 'text-amber-700'];

export default function CommunityList({ entries }: { entries: CommunityEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-zinc-400">
        Not enough ratings yet to rank this — check back once more people have weighed in.
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry, i) => {
        const poster = tmdbPosterUrl(entry.title.poster_path);
        const rankColor = RANK_COLORS[i] ?? 'text-zinc-500';
        return (
          <li
            key={entry.title.id}
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
                {entry.title.media_type} · based on {entry.stat.rating_count} rating
                {entry.stat.rating_count === 1 ? '' : 's'}
              </p>
            </div>
            <span className="score-badge">{entry.stat.weighted_score.toFixed(1)}</span>
          </li>
        );
      })}
    </ol>
  );
}
