'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { Rating, Title, TmdbSearchResult, UserTitle, WatchStatus } from '@/lib/types';
import { computeDynamicScore } from '@/lib/scoring';

interface Props {
  isAuthenticated: boolean;
  /** Title row from our DB, or live TMDB data if not yet added. */
  source: { kind: 'cached'; title: Title } | { kind: 'live'; result: TmdbSearchResult };
  userTitle: UserTitle | null;
  ratings: Rating[];
}

const STATUS_OPTIONS: WatchStatus[] = ['watchlist', 'watching', 'completed', 'dropped'];

export default function TitleDetail({ isAuthenticated, source, userTitle, ratings }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');

  const name = source.kind === 'cached' ? source.title.name : source.result.name;
  const overview = source.kind === 'cached' ? source.title.overview : source.result.overview;
  const posterPath =
    source.kind === 'cached' ? source.title.poster_path : source.result.poster_path;
  const mediaType = source.kind === 'cached' ? source.title.media_type : source.result.media_type;
  const releaseDate =
    source.kind === 'cached' ? source.title.release_date : source.result.release_date;
  const tmdbId = source.kind === 'cached' ? source.title.tmdb_id : source.result.tmdb_id;

  const poster = tmdbPosterUrl(posterPath, 'w342');
  const latestRating = ratings[0] ?? null;
  const dynamicScore = userTitle ? computeDynamicScore(userTitle, latestRating) : null;

  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: tmdbId,
          media_type: mediaType,
          name,
          poster_path: posterPath,
          release_date: releaseDate,
          overview,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add title');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add title');
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(status: WatchStatus) {
    if (!userTitle) return;
    setBusy(true);
    setError(null);
    try {
      const patch: Record<string, unknown> = { status };
      if (status === 'completed') {
        patch.completed_at = new Date().toISOString();
        patch.last_watched_at = new Date().toISOString();
      }
      if (status === 'watching' && !userTitle.started_at) {
        patch.started_at = new Date().toISOString();
      }
      const res = await fetch(`/api/library/${userTitle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update status');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogRewatch() {
    if (!userTitle) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/${userTitle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewatch_count: userTitle.rewatch_count + 1,
          last_watched_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to log rewatch');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log rewatch');
    } finally {
      setBusy(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (source.kind !== 'cached') return;
    const score = Number(scoreInput);
    if (Number.isNaN(score) || score < 0 || score > 10) {
      setError('Score must be between 0 and 10');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_id: source.title.id,
          score,
          reason: ratings.length === 0 ? 'initial' : 'manual',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save rating');
      await fetch(`/api/library/${userTitle?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_watched_at: new Date().toISOString() }),
      });
      setScoreInput('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rating');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      {poster ? (
        <Image
          src={poster}
          alt={name}
          width={342}
          height={513}
          className="h-fit w-48 shrink-0 rounded"
        />
      ) : (
        <div className="flex h-72 w-48 shrink-0 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
          No poster
        </div>
      )}

      <div className="flex-1">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="mb-4 text-xs uppercase text-zinc-500">
          {mediaType} · {releaseDate?.slice(0, 4) ?? '—'}
        </p>
        <p className="mb-6 text-sm text-zinc-300">{overview}</p>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {!isAuthenticated ? (
          <p className="text-sm text-zinc-400">
            <a href="/login" className="text-accent underline">
              Log in
            </a>{' '}
            to add this to your library.
          </p>
        ) : !userTitle ? (
          <button
            onClick={handleAdd}
            disabled={busy}
            className="rounded bg-accent px-4 py-2 font-medium text-black disabled:opacity-50"
          >
            {busy ? 'Adding…' : 'Add to library'}
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase text-zinc-500">Status</label>
              <select
                value={userTitle.status}
                onChange={(e) => handleStatusChange(e.target.value as WatchStatus)}
                disabled={busy}
                className="rounded border border-zinc-700 bg-surface px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-zinc-400">
              {userTitle.last_watched_at && (
                <p>
                  Last watched:{' '}
                  {new Date(userTitle.last_watched_at).toLocaleDateString()}
                </p>
              )}
              <p>Rewatches: {userTitle.rewatch_count}</p>
              {dynamicScore !== null && (
                <p className="mt-1 text-lg font-semibold text-accent">
                  Dynamic score: {dynamicScore.toFixed(1)}
                </p>
              )}
            </div>

            <button
              onClick={handleLogRewatch}
              disabled={busy}
              className="w-fit rounded border border-zinc-700 px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50"
            >
              Log a rewatch
            </button>

            <form onSubmit={handleRate} className="flex items-end gap-2">
              <div>
                <label className="mb-1 block text-xs uppercase text-zinc-500">
                  {ratings.length === 0 ? 'Rate it' : 'Update score'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="0-10"
                  className="w-24 rounded border border-zinc-700 bg-surface px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-accent px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                Submit
              </button>
            </form>

            {ratings.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase text-zinc-500">Score history</p>
                <ul className="text-sm text-zinc-400">
                  {ratings.map((r) => (
                    <li key={r.id}>
                      {r.score.toFixed(1)} — {r.reason} ·{' '}
                      {new Date(r.created_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
