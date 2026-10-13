import type { MediaType, TmdbSearchResult } from './types';

const TMDB_BASE = 'https://api.themoviedb.org/3';

interface TmdbRawResult {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  /** Movie detail endpoint only. */
  runtime?: number | null;
  /** TV detail endpoint only — one entry per typical episode length. */
  episode_run_time?: number[];
}

/**
 * Fallbacks for the (common) case where TMDB has no runtime on record.
 * Rough genre-wide medians — good enough that hours-watched stays in the right
 * ballpark, and always beats silently crediting zero minutes.
 */
export const FALLBACK_MOVIE_RUNTIME = 110;
export const FALLBACK_EPISODE_RUNTIME = 42;

function extractRuntime(raw: TmdbRawResult): number | null {
  if (typeof raw.runtime === 'number' && raw.runtime > 0) return raw.runtime;
  const episodeRuntime = raw.episode_run_time?.find((m) => m > 0);
  return episodeRuntime ?? null;
}

function mapResult(raw: TmdbRawResult): TmdbSearchResult {
  return {
    tmdb_id: raw.id,
    media_type: raw.media_type as MediaType,
    name: raw.title ?? raw.name ?? 'Untitled',
    poster_path: raw.poster_path,
    release_date: raw.release_date ?? raw.first_air_date ?? null,
    overview: raw.overview,
    runtime_minutes: extractRuntime(raw),
  };
}

/** Runtime to credit one logged watch, with the fallback applied. */
export function resolveRuntime(
  mediaType: MediaType,
  runtimeMinutes: number | null | undefined
): number {
  if (typeof runtimeMinutes === 'number' && runtimeMinutes > 0) return runtimeMinutes;
  return mediaType === 'movie' ? FALLBACK_MOVIE_RUNTIME : FALLBACK_EPISODE_RUNTIME;
}

export async function searchTitles(query: string): Promise<TmdbSearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured');
  }

  const url = new URL(`${TMDB_BASE}/search/multi`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', query);
  url.searchParams.set('include_adult', 'false');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB search failed: ${res.status}`);
  }

  const data: { results: TmdbRawResult[] } = await res.json();

  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map(mapResult);
}

export async function getTmdbDetails(
  tmdbId: number,
  mediaType: MediaType
): Promise<TmdbSearchResult> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured');
  }

  const url = new URL(`${TMDB_BASE}/${mediaType}/${tmdbId}`);
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB details lookup failed: ${res.status}`);
  }

  const raw: TmdbRawResult = await res.json();
  return mapResult({ ...raw, media_type: mediaType });
}

export async function getTmdbSimilar(
  tmdbId: number,
  mediaType: MediaType
): Promise<TmdbSearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  const url = new URL(`${TMDB_BASE}/${mediaType}/${tmdbId}/similar`);
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data: { results: Omit<TmdbRawResult, 'media_type'>[] } = await res.json();
  return data.results.slice(0, 12).map((r) =>
    mapResult({ ...r, media_type: mediaType })
  );
}

export function tmdbPosterUrl(posterPath: string | null, size: 'w185' | 'w342' = 'w185') {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}
