import Image from 'next/image';
import Link from 'next/link';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { ActivityEvent } from '@/lib/types';

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function eventLabel(event: ActivityEvent) {
  if (event.activity_type === 'rating') {
    return `rated ${parseFloat(event.metadata).toFixed(1)}/10`;
  }
  const statusLabels: Record<string, string> = {
    watchlist: 'added to watchlist',
    watching: 'is now watching',
    completed: 'finished watching',
    dropped: 'dropped',
  };
  return statusLabels[event.metadata] ?? event.metadata;
}

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded bg-surface p-6 text-center text-zinc-400">
        <p className="mb-1 font-medium">Nothing yet.</p>
        <p className="text-sm">Follow some people to see their activity here.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event, i) => {
        const poster = tmdbPosterUrl(event.poster_path);
        const titleHref = `/title/${event.media_type}/${event.tmdb_id}`;
        return (
          <li key={i} className="flex items-center gap-3 rounded bg-surface p-3">
            {poster ? (
              <Image
                src={poster}
                alt={event.title_name}
                width={36}
                height={54}
                className="shrink-0 rounded"
              />
            ) : (
              <div className="h-[54px] w-9 shrink-0 rounded bg-zinc-800" />
            )}
            <div className="flex-1 text-sm">
              <span className="font-medium">
                <Link href={`/profile/${event.username}`} className="hover:text-accent">
                  {event.username}
                </Link>
              </span>
              {event.is_trusted && (
                <span className="mx-1 rounded bg-amber-600/30 px-1 py-0.5 text-xs text-amber-400">
                  ★
                </span>
              )}{' '}
              {eventLabel(event)}{' '}
              <Link href={titleHref} className="font-medium hover:text-accent">
                {event.title_name}
              </Link>
            </div>
            <span className="shrink-0 text-xs text-zinc-500">
              {formatRelative(event.created_at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
