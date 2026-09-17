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
  const [searched, setSearched] = useState(false);
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
      setSearched(true);
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
          className="input flex-1"
          autoFocus
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-3">
              <div className="skeleton mb-2 aspect-[2/3] w-full" />
              <div className="skeleton mb-1.5 h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="card p-6 text-center text-sm text-zinc-400">
          No results for “{query}”. Try another spelling.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {results.map((result) => {
            const key = `${result.media_type}-${result.tmdb_id}`;
            const poster = tmdbPosterUrl(result.poster_path);
            return (
              <div key={key} className="card card-hover group flex flex-col p-3">
                <div className="mb-2 overflow-hidden rounded-lg">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={result.name}
                      width={185}
                      height={278}
                      className="w-full transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] w-full items-center justify-center bg-zinc-800 text-xs text-zinc-500">
                      No poster
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium">{result.name}</p>
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                  {result.media_type} · {result.release_date?.slice(0, 4) ?? '—'}
                </p>
                <button
                  onClick={() => handleAdd(result)}
                  disabled={addingKey === key}
                  className="btn-primary mt-auto w-full px-2 py-1.5 text-xs"
                >
                  {addingKey === key ? 'Adding…' : '+ Add to library'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
