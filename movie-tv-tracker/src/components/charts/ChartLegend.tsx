import { SERIES } from '@/lib/chart-theme';

/**
 * Identity is never carried by colour alone — the legend is always present for
 * the two-series charts, and the swatch sits beside text in a normal ink token.
 */
export default function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-zinc-400">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: SERIES.tv }}
        />
        TV
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: SERIES.movie }}
        />
        Movies
      </span>
    </div>
  );
}
