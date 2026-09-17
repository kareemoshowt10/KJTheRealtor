'use client';

import Link from 'next/link';
import { seriesColor } from '@/lib/chart-theme';
import { formatMinutes } from '@/lib/dates';
import type { TopTitle } from '@/lib/types';
import ChartLegend from './ChartLegend';

/**
 * Horizontal bars — the labels are title names, which don't fit under columns.
 * Each bar wears its own media type's colour, so the encoding matches every
 * other chart on the page.
 */
export default function TopTitlesChart({ titles }: { titles: TopTitle[] }) {
  if (titles.length === 0) {
    return (
      <div className="card p-4">
        <h2 className="mb-1 text-sm font-semibold">Where your time goes</h2>
        <p className="text-sm text-zinc-500">Log a few watches to see your biggest time sinks.</p>
      </div>
    );
  }

  const max = Math.max(...titles.map((t) => t.minutes), 1);

  return (
    <div className="card min-w-0 p-4">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Where your time goes</h2>
          <p className="text-xs text-zinc-500">Total hours logged per title</p>
        </div>
        <ChartLegend />
      </div>

      <ul className="flex flex-col gap-2.5">
        {titles.map(({ title, minutes, plays }) => (
          <li key={title.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <Link
                href={`/title/${title.media_type}/${title.tmdb_id}`}
                className="min-w-0 truncate text-zinc-300 hover:text-accent"
              >
                {title.name}
              </Link>
              <span className="shrink-0 tabular-nums text-zinc-400">
                {formatMinutes(minutes)}
                <span className="ml-1.5 text-zinc-500">
                  {plays}
                  {title.media_type === 'tv' ? ' eps' : plays === 1 ? ' play' : ' plays'}
                </span>
              </span>
            </div>
            <div
              className="h-2 rounded-r-[4px]"
              style={{
                width: `${Math.max((minutes / max) * 100, 1.5)}%`,
                backgroundColor: seriesColor(title.media_type),
              }}
              aria-label={`${title.name}: ${formatMinutes(minutes)}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
