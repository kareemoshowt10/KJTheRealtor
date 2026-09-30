'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localTodayKey } from '@/lib/dates';
import type { MediaType, UserTitle } from '@/lib/types';

interface Props {
  titleId: string;
  mediaType: MediaType;
  userTitle: UserTitle;
}

export default function WatchLogger({ titleId, mediaType, userTitle }: Props) {
  const router = useRouter();
  const isTv = mediaType === 'tv';

  // Prefill the episode you'd most likely log next — the one after your progress.
  const nextSeason = userTitle.current_season ?? 1;
  const nextEpisode = (userTitle.current_episode ?? 0) + 1;

  const [season, setSeason] = useState(String(nextSeason));
  const [episode, setEpisode] = useState(String(nextEpisode));
  const [throughEpisode, setThroughEpisode] = useState('');
  const [watchedDate, setWatchedDate] = useState(localTodayKey());
  const [isRewatch, setIsRewatch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmation(null);

    const payload: Record<string, unknown> = {
      title_id: titleId,
      watched_date: watchedDate,
      is_rewatch: isRewatch,
    };

    if (isTv) {
      const s = Number(season);
      const first = Number(episode);
      if (!Number.isInteger(s) || s < 1 || !Number.isInteger(first) || first < 1) {
        setError('Season and episode must be whole numbers of 1 or more');
        return;
      }
      payload.season_number = s;
      payload.episode_number = first;
      if (throughEpisode !== '') {
        const last = Number(throughEpisode);
        if (!Number.isInteger(last) || last < first) {
          setError('The last episode must be a whole number at or after the first');
          return;
        }
        payload.through_episode = last;
      }
    }

    // The date input gives a calendar day, not a time. Preserve the actual clock
    // time when logging today so same-day entries keep their real order.
    const isToday = watchedDate === localTodayKey();
    payload.watched_at = isToday
      ? new Date().toISOString()
      : new Date(`${watchedDate}T20:00:00`).toISOString();

    setBusy(true);
    try {
      const res = await fetch('/api/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to log watch');

      const count: number = data.logged ?? 1;
      setConfirmation(
        isTv
          ? `Logged ${count} episode${count === 1 ? '' : 's'}`
          : `Logged ${isRewatch ? 'a rewatch' : 'a watch'}`
      );

      if (isTv) {
        // Advance to the episode after whatever we just logged.
        const last = throughEpisode !== '' ? Number(throughEpisode) : Number(episode);
        setEpisode(String(last + 1));
        setThroughEpisode('');
      }
      setIsRewatch(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log watch');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleLog} className="card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Log a watch</h2>
        {userTitle.current_season != null && userTitle.current_episode != null && isTv && (
          <span className="text-xs text-zinc-500">
            Progress: S{userTitle.current_season} · E{userTitle.current_episode}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {isTv && (
          <>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                Season
              </label>
              <input
                type="number"
                min={1}
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="input w-20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                Episode
              </label>
              <input
                type="number"
                min={1}
                value={episode}
                onChange={(e) => setEpisode(e.target.value)}
                className="input w-20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                Through
              </label>
              <input
                type="number"
                min={1}
                value={throughEpisode}
                onChange={(e) => setThroughEpisode(e.target.value)}
                placeholder="opt."
                title="Binged a run? Log every episode up to this one in one go."
                className="input w-20"
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Watched on
          </label>
          <input
            type="date"
            value={watchedDate}
            max={localTodayKey()}
            onChange={(e) => setWatchedDate(e.target.value)}
            className="input"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={isRewatch}
            onChange={(e) => setIsRewatch(e.target.checked)}
            className="h-4 w-4 accent-[#d95926]"
          />
          Rewatch
        </label>

        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Logging…' : isTv ? 'Log episodes' : 'Log watch'}
        </button>
      </div>

      {isTv && (
        <p className="mt-2 text-xs text-zinc-500">
          Binged a run? Set “Through” to log the whole stretch as separate episodes.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {confirmation && !error && (
        <p className="mt-3 text-sm text-[#0ca30c]">{confirmation}</p>
      )}
    </form>
  );
}
