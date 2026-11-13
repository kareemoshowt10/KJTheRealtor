'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { seriesColor } from '@/lib/chart-theme';
import { parseDateKey } from '@/lib/dates';
import type { WatchEventWithTitle } from '@/lib/types';

export default function RecentWatchLog({ entries }: { entries: WatchEventWithTitle[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(eventId: string) {
    setRemoving(eventId);
    setError(null);
    try {
      const res = await fetch(`/api/watch/${eventId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove entry');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove entry');
    } finally {
      setRemoving(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="card p-4">
        <h2 className="mb-1 text-sm font-semibold">Recent watches</h2>
        <p className="text-sm text-zinc-500">
          Nothing logged yet. Open a title and hit “Log a watch”.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">Recent watches</h2>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <ul className="flex flex-col divide-y divide-line">
        {entries.map(({ event, title }) => (
          <li key={event.id} className="flex items-center gap-3 py-2 first:pt-0">
            <span
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: seriesColor(event.media_type) }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/title/${title.media_type}/${title.tmdb_id}`}
                className="block truncate text-sm text-zinc-200 hover:text-accent"
              >
                {title.name}
                {event.season_number != null && event.episode_number != null && (
                  <span className="ml-1.5 text-zinc-500">
                    S{event.season_number}·E{event.episode_number}
                  </span>
                )}
              </Link>
              <p className="text-xs text-zinc-500">
                {parseDateKey(event.watched_date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
                {event.is_rewatch && ' · rewatch'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(event.id)}
              disabled={removing === event.id}
              aria-label={`Remove ${title.name} from your watch log`}
              className="shrink-0 rounded px-2 py-1 text-xs text-zinc-500 transition hover:text-red-400 disabled:opacity-50"
            >
              {removing === event.id ? '…' : 'Remove'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
