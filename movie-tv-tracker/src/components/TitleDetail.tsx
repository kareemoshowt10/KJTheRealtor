'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { Rating, Title, TmdbSearchResult, UserTitle, WatchStatus } from '@/lib/types';
import { computeDynamicScore } from '@/lib/scoring';
import ScoreSparkline from './ScoreSparkline';

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
  const [seasonInput, setSeasonInput] = useState(
    userTitle?.current_season != null ? String(userTitle.current_season) : ''
  );
  const [episodeInput, setEpisodeInput] = useState(
    userTitle?.current_episode != null ? String(userTitle.current_episode) : ''
  );

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

  async function patchLibrary(patch: Record<string, unknown>, failMsg: string) {
    if (!userTitle) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/${userTitle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? failMsg);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : failMsg);
    } finally {
      setBusy(false);
    }
  }

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
    const patch: Record<string, unknown> = { status };
    if (status === 'completed') {
      patch.completed_at = new Date().toISOString();
      patch.last_watched_at = new Date().toISOString();
    }
    if (status === 'watching' && !userTitle.started_at) {
      patch.started_at = new Date().toISOString();
    }
    await patchLibrary(patch, 'Failed to update status');
  }

  async function handleLogRewatch() {
    if (!userTitle) return;
    await patchLibrary(
      {
        rewatch_count: userTitle.rewatch_count + 1,
        last_watched_at: new Date().toISOString(),
      },
      'Failed to log rewatch'
    );
  }

  async function handleSaveProgress(e: React.FormEvent) {
    e.preventDefault();
    const season = seasonInput === '' ? null : Number(seasonInput);
    const episode = episodeInput === '' ? null : Number(episodeInput);
    if (
      (season !== null && (!Number.isInteger(season) || season < 0)) ||
      (episode !== null && (!Number.isInteger(episode) || episode < 0))
    ) {
      setError('Season and episode must be whole numbers');
      return;
    }
    await patchLibrary(
      {
        current_season: season,
        current_episode: episode,
        last_watched_at: new Date().toISOString(),
      },
      'Failed to save progress'
    );
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
    <div className="flex animate-fade-in-up flex-col gap-6 sm:flex-row">
      {poster ? (
        <Image
          src={poster}
          alt={name}
          width={342}
          height={513}
          className="h-fit w-48 shrink-0 rounded-xl shadow-card"
        />
      ) : (
        <div className="flex h-72 w-48 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xs text-zinc-500">
          No poster
        </div>
      )}

      <div className="flex-1">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {mediaType} · {releaseDate?.slice(0, 4) ?? '—'}
            </p>
          </div>
          {dynamicScore !== null && (
            <div className="text-right">
              <span className="score-badge px-3 py-1.5 text-xl">{dynamicScore.toFixed(1)}</span>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
                Dynamic score
              </p>
            </div>
          )}
        </div>
        <p className="mb-6 text-sm leading-relaxed text-zinc-300">{overview}</p>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {!isAuthenticated ? (
          <p className="text-sm text-zinc-400">
            <a href="/login" className="text-accent underline">
              Log in
            </a>{' '}
            to add this to your library.
          </p>
        ) : !userTitle ? (
          <button onClick={handleAdd} disabled={busy} className="btn-primary">
            {busy ? 'Adding…' : '+ Add to library'}
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="card flex flex-wrap items-end gap-4 p-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                  Status
                </label>
                <select
                  value={userTitle.status}
                  onChange={(e) => handleStatusChange(e.target.value as WatchStatus)}
                  disabled={busy}
                  className="input"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={handleLogRewatch} disabled={busy} className="btn-ghost">
                Log a rewatch ({userTitle.rewatch_count})
              </button>

              {userTitle.last_watched_at && (
                <p className="text-sm text-zinc-500">
                  Last watched {new Date(userTitle.last_watched_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {mediaType === 'tv' && (
              <form onSubmit={handleSaveProgress} className="card flex flex-wrap items-end gap-3 p-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                    Season
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={seasonInput}
                    onChange={(e) => setSeasonInput(e.target.value)}
                    placeholder="S"
                    className="input w-20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                    Episode
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={episodeInput}
                    onChange={(e) => setEpisodeInput(e.target.value)}
                    placeholder="E"
                    className="input w-20"
                  />
                </div>
                <button type="submit" disabled={busy} className="btn-ghost">
                  Save progress
                </button>
                {userTitle.current_season != null && userTitle.current_episode != null && (
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                    S{userTitle.current_season} · E{userTitle.current_episode}
                  </span>
                )}
              </form>
            )}

            <form onSubmit={handleRate} className="card flex items-end gap-3 p-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
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
                  className="input w-24"
                />
              </div>
              <button type="submit" disabled={busy} className="btn-primary">
                Submit
              </button>
            </form>

            {ratings.length > 0 && (
              <div className="card p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                  Score history
                </p>
                <ScoreSparkline ratings={ratings} />
                <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                  {ratings.map((r) => (
                    <li key={r.id} className="flex items-center gap-2">
                      <span className="w-9 font-semibold text-zinc-200">
                        {r.score.toFixed(1)}
                      </span>
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">{r.reason}</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
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
