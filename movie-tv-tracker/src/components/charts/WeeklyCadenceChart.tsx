'use client';

import { useState } from 'react';
import { GRID_LINE, SERIES, niceMax } from '@/lib/chart-theme';
import { formatMinutes, parseDateKey, addDays } from '@/lib/dates';
import type { WeekBucket } from '@/lib/types';
import ChartLegend from './ChartLegend';

const PLOT_HEIGHT = 180;
const TICKS = 4;

function monthLabel(weekStart: string): string {
  return parseDateKey(weekStart).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
}

function weekRangeLabel(weekStart: string): string {
  const start = parseDateKey(weekStart);
  const end = addDays(start, 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function WeeklyCadenceChart({ weeks }: { weeks: WeekBucket[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (weeks.length === 0) {
    return (
      <div className="card p-4">
        <h2 className="mb-1 text-sm font-semibold">Weekly watch time</h2>
        <p className="text-sm text-zinc-500">Log a watch and your weekly rhythm shows up here.</p>
      </div>
    );
  }

  const maxMinutes = Math.max(...weeks.map((w) => w.tvMinutes + w.movieMinutes), 1);
  const axisMaxHours = niceMax(maxMinutes / 60);
  const axisMaxMinutes = axisMaxHours * 60;

  const activeWeek = active !== null ? weeks[active] : null;

  return (
    <div className="card min-w-0 p-4">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Weekly watch time</h2>
          <p className="text-xs text-zinc-500">Hours per week, last {weeks.length} weeks</p>
        </div>
        <ChartLegend />
      </div>

      <div className="flex gap-2">
        {/* Y axis */}
        <div
          className="relative w-9 shrink-0 text-right text-[10px] tabular-nums text-zinc-500"
          style={{ height: PLOT_HEIGHT }}
        >
          {Array.from({ length: TICKS + 1 }, (_, i) => {
            const value = (axisMaxHours / TICKS) * (TICKS - i);
            return (
              <span
                key={i}
                className="absolute right-0 -translate-y-1/2"
                style={{ top: `${(i / TICKS) * 100}%` }}
              >
                {Number.isInteger(value) ? value : value.toFixed(1)}h
              </span>
            );
          })}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Recessive solid hairline grid */}
          <div className="pointer-events-none absolute inset-0" style={{ height: PLOT_HEIGHT }}>
            {Array.from({ length: TICKS + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute inset-x-0"
                style={{
                  top: `${(i / TICKS) * 100}%`,
                  borderTop: `1px solid ${GRID_LINE}`,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-end gap-[2px]" style={{ height: PLOT_HEIGHT }}>
            {weeks.map((week, i) => {
              const total = week.tvMinutes + week.movieMinutes;
              const tvPct = (week.tvMinutes / axisMaxMinutes) * 100;
              const moviePct = (week.movieMinutes / axisMaxMinutes) * 100;
              const isActive = active === i;

              return (
                <div
                  key={week.weekStart}
                  tabIndex={0}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={`Week of ${weekRangeLabel(week.weekStart)}: ${formatMinutes(total)} watched`}
                  className="group flex h-full min-w-0 flex-1 cursor-default items-end justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <div
                    className="flex h-full w-full flex-col justify-end gap-[2px] transition-opacity"
                    style={{ maxWidth: 24, opacity: active === null || isActive ? 1 : 0.55 }}
                  >
                    {week.movieMinutes > 0 && (
                      <div
                        style={{
                          height: `${moviePct}%`,
                          backgroundColor: SERIES.movie,
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                    )}
                    {week.tvMinutes > 0 && (
                      <div
                        style={{
                          height: `${tvPct}%`,
                          backgroundColor: SERIES.tv,
                          // Only the top of the stack gets the rounded data-end.
                          borderRadius: week.movieMinutes > 0 ? 0 : '4px 4px 0 0',
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {activeWeek && (
              <div
                className="pointer-events-none absolute top-1 z-10 w-max max-w-[min(14rem,92%)] rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-xs shadow-card"
                // Anchor by whichever side keeps the tooltip inside the plot:
                // left-half columns grow rightward, right-half columns grow leftward.
                style={
                  active! < weeks.length / 2
                    ? { left: `${(active! / weeks.length) * 100}%` }
                    : { right: `${((weeks.length - 1 - active!) / weeks.length) * 100}%` }
                }
              >
                <p className="mb-0.5 font-semibold text-zinc-100">
                  {weekRangeLabel(activeWeek.weekStart)}
                </p>
                <p className="text-zinc-400">
                  {formatMinutes(activeWeek.tvMinutes + activeWeek.movieMinutes)} total
                </p>
                {activeWeek.episodes > 0 && (
                  <p className="text-zinc-400">
                    {activeWeek.episodes} episode{activeWeek.episodes === 1 ? '' : 's'} ·{' '}
                    {formatMinutes(activeWeek.tvMinutes)}
                  </p>
                )}
                {activeWeek.movies > 0 && (
                  <p className="text-zinc-400">
                    {activeWeek.movies} movie{activeWeek.movies === 1 ? '' : 's'} ·{' '}
                    {formatMinutes(activeWeek.movieMinutes)}
                  </p>
                )}
                {activeWeek.episodes === 0 && activeWeek.movies === 0 && (
                  <p className="text-zinc-500">Nothing logged</p>
                )}
              </div>
            )}
          </div>

          {/* Baseline */}
          <div style={{ borderTop: `1px solid ${GRID_LINE}` }} />

          {/* X axis — labelled only where the month turns over */}
          <div className="flex gap-[2px] pt-1">
            {weeks.map((week, i) => {
              const label = monthLabel(week.weekStart);
              const show = i === 0 || label !== monthLabel(weeks[i - 1].weekStart);
              return (
                <div
                  key={week.weekStart}
                  className="min-w-0 flex-1 text-center text-[10px] text-zinc-500"
                >
                  {show ? label : ''}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <details className="mt-3 text-xs text-zinc-400">
        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300">Table view</summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full text-left tabular-nums">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1 pr-2 font-medium">Week of</th>
                <th className="py-1 pr-2 font-medium">Episodes</th>
                <th className="py-1 pr-2 font-medium">Movies</th>
                <th className="py-1 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...weeks].reverse().map((w) => (
                <tr key={w.weekStart} className="border-t border-line">
                  <td className="py-1 pr-2">{weekRangeLabel(w.weekStart)}</td>
                  <td className="py-1 pr-2">{w.episodes}</td>
                  <td className="py-1 pr-2">{w.movies}</td>
                  <td className="py-1">{formatMinutes(w.tvMinutes + w.movieMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
