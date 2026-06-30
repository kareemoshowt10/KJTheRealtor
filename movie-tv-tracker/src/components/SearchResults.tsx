'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { TmdbSearchResult } from '@/lib/types';

export default function SearchResults() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(result: TmdbSearchResult) {
    const key = `${result.media_type}-${result.tmdb_id}`;
    setAddingKey(key);
    setError(null);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add title');
      router.push(`/title/${result.media_type}/${result.tmdb_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add title');
    } finally {
      setAddingKey(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies and TV shows…"
          className="flex-1 rounded border border-zinc-700 bg-surface px-3 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-accent px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {results.map((result) => {
          const key = `${result.media_type}-${result.tmdb_id}`;
          const poster = tmdbPosterUrl(result.poster_path);
          return (
            <div key={key} className="rounded bg-surface p-3">
              {poster ? (
                <Image
                  src={poster}
                  alt={result.name}
                  width={185}
                  height={278}
                  className="mb-2 w-full rounded"
                />
              ) : (
                <div className="mb-2 flex h-[278px] w-full items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
                  No poster
                </div>
              )}
              <p className="text-sm font-medium">{result.name}</p>
              <p className="mb-2 text-xs uppercase text-zinc-500">
                {result.media_type} · {result.release_date?.slice(0, 4) ?? '—'}
              </p>
              <button
                onClick={() => handleAdd(result)}
                disabled={addingKey === key}
                className="w-full rounded bg-accent/90 px-2 py-1 text-xs font-medium text-black disabled:opacity-50"
              >
                {addingKey === key ? 'Adding…' : 'Add to library'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
