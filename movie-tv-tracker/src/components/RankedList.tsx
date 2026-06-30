import Image from 'next/image';
import Link from 'next/link';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { RankedEntry } from '@/lib/types';

export default function RankedList({ entries }: { entries: RankedEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-zinc-400">Nothing tracked yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry, i) => {
        const poster = tmdbPosterUrl(entry.title.poster_path);
        return (
          <li key={entry.userTitle.id} className="flex items-center gap-4 rounded bg-surface p-3">
            <span className="w-6 text-right text-sm text-zinc-500">{i + 1}</span>
            {poster ? (
              <Image src={poster} alt={entry.title.name} width={40} height={60} className="rounded" />
            ) : (
              <div className="h-[60px] w-10 rounded bg-zinc-800" />
            )}
            <div className="flex-1">
              <Link
                href={`/title/${entry.title.media_type}/${entry.title.tmdb_id}`}
                className="font-medium hover:text-accent"
              >
                {entry.title.name}
              </Link>
              <p className="text-xs uppercase text-zinc-500">
                {entry.title.media_type} · {entry.userTitle.status}
              </p>
            </div>
            <span className="text-lg font-semibold text-accent">
              {entry.dynamicScore !== null ? entry.dynamicScore.toFixed(1) : '—'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
