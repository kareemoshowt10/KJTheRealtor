/**
 * Chart palette for the watch-behavior dashboard.
 *
 * Two categorical slots — TV and Movies — in a fixed order. Colour follows the
 * media type everywhere it appears (cadence chart, weekday chart, top titles),
 * so orange always means TV and blue always means a movie.
 *
 * Validated against the card surface this dashboard renders on:
 *   node scripts/validate_palette.js "#d95926,#3987e5" --mode dark --surface "#161922"
 *   → lightness band, chroma floor, CVD separation (worst adjacent ΔE 26.8
 *     protan / 32.4 tritan), normal-vision floor (ΔE 31.8) and 3:1 contrast all PASS.
 *
 * The brand accent (#ff8c42) is deliberately NOT a series colour: it sits at
 * L 0.754, outside the dark lightness band. It stays on buttons and chrome.
 */
export const SERIES = {
  tv: '#d95926',
  movie: '#3987e5',
} as const;

/** Chart chrome — the app's own line token is exactly one step off the surface. */
export const CHART_SURFACE = '#161922';
export const GRID_LINE = '#242a3d';

export function seriesColor(mediaType: 'movie' | 'tv'): string {
  return mediaType === 'tv' ? SERIES.tv : SERIES.movie;
}

/** Round an axis maximum up to a clean number so ticks read 0 / 2 / 4 / 6. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}
