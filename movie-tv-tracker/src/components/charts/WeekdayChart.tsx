'use client';

import { useState } from 'react';
import { GRID_LINE, SERIES } from '@/lib/chart-theme';
import { formatMinutes } from '@/lib/dates';
import type { DayBucket } from '@/lib/types';
import ChartLegend from './ChartLegend';

const PLOT_HEIGHT = 120;
const LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekdayChart({ days }: { days: DayBucket[] }) {
  const [active, setActive] = useState<number | null>(null);

  const totals = days.map((d) => d.tvMinutes + d.movieMinutes);
  const max = Math.max(...totals, 1);
  const hasData = totals.some((t) => t > 0);
  const peakIndex = totals.indexOf(Math.max(...totals));

  return (
    <div className="card min-w-0 p-4">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">When you watch</h2>
          <p className="text-xs text-zinc-500">Total time by day of week</p>
        </div>
        <ChartLegend />
      </div>

      {!hasData ? (
        <p className="text-sm text-zinc-500">No watches logged yet.</p>
      ) : (
        <>
          <div className="flex items-end gap-[2px]" style={{ height: PLOT_HEIGHT }}>
            {days.map((day, i) => {
              const total = day.tvMinutes + day.movieMinutes;
              const isActive = active === i;
              return (
                <div
                  key={day.weekday}
                  tabIndex={0}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={`${LABELS[day.weekday]}: ${formatMinutes(total)}`}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <div
                    className="flex h-full w-full flex-col justify-end gap-[2px] transition-opacity"
                    style={{ maxWidth: 24, opacity: active === null || isActive ? 1 : 0.55 }}
                  >
                    {day.movieMinutes > 0 && (
                      <div
                        style={{
                          height: `${(day.movieMinutes / max) * 100}%`,
                          backgroundColor: SERIES.movie,
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                    )}
                    {day.tvMinutes > 0 && (
                      <div
                        style={{
                          height: `${(day.tvMinutes / max) * 100}%`,
                          backgroundColor: SERIES.tv,
                          borderRadius: day.movieMinutes > 0 ? 0 : '4px 4px 0 0',
                        }}
                      />
                    )}
                  </div>

                  {/* Only the peak day is direct-labelled; the rest live in the tooltip and table. */}
                  {(isActive || (active === null && i === peakIndex && total > 0)) && (
                    <span className="pointer-events-none absolute -top-5 whitespace-nowrap text-[10px] font-medium text-zinc-300">
                      {formatMinutes(total)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: `1px solid ${GRID_LINE}` }} />

          <div className="flex gap-[2px] pt-1">
            {days.map((day, i) => (
              <div
                key={day.weekday}
                className={`flex-1 text-center text-[10px] ${
                  i === peakIndex ? 'text-zinc-300' : 'text-zinc-500'
                }`}
              >
                {LABELS[day.weekday]}
              </div>
            ))}
          </div>

          <details className="mt-3 text-xs text-zinc-400">
            <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300">
              Table view
            </summary>
            <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left tabular-nums">
              <thead className="text-zinc-500">
                <tr>
                  <th className="py-1 pr-2 font-medium">Day</th>
                  <th className="py-1 pr-2 font-medium">TV</th>
                  <th className="py-1 pr-2 font-medium">Movies</th>
                  <th className="py-1 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.weekday} className="border-t border-line">
                    <td className="py-1 pr-2">{LABELS[d.weekday]}</td>
                    <td className="py-1 pr-2">{formatMinutes(d.tvMinutes)}</td>
                    <td className="py-1 pr-2">{formatMinutes(d.movieMinutes)}</td>
                    <td className="py-1">{formatMinutes(d.tvMinutes + d.movieMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
