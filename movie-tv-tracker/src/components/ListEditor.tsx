'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { Title } from '@/lib/types';

interface ListItemWithTitle {
  list_id: string;
  title_id: string;
  rank: number;
  added_by: string;
  titles: Title;
}

interface Props {
  listId: string;
  initialItems: ListItemWithTitle[];
  canEdit: boolean;
}

export default function ListEditor({ listId, initialItems, canEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems.sort((a, b) => a.rank - b.rank));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { tmdb_id: number; media_type: string; name: string; poster_path: string | null; release_date: string | null; overview: string | null }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setSearchResults(data.results ?? []);
    setSearching(false);
  }

  async function handleAdd(result: typeof searchResults[number]) {
    const key = `${result.media_type}-${result.tmdb_id}`;
    setAddingKey(key);
    setError(null);
    const res = await fetch(`/api/lists/${listId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to add');
    } else {
      startTransition(() => router.refresh());
    }
    setAddingKey(null);
  }

  async function handleRemove(titleId: string) {
    await fetch(`/api/lists/${listId}/items/${titleId}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.title_id !== titleId));
    startTransition(() => router.refresh());
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const newItems = [...items];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    const reranked = newItems.map((item, i) => ({ ...item, rank: i + 1 }));
    setItems(reranked);

    await fetch(`/api/lists/${listId}/items/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reranked.map(({ title_id, rank }) => ({ title_id, rank })),
      }),
    });
  }

  return (
    <div>
      <ol className="mb-6 flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-zinc-400">No titles yet. {canEdit ? 'Search below to add some.' : ''}</p>
        )}
        {items.map((item, i) => {
          const poster = tmdbPosterUrl(item.titles.poster_path);
          return (
            <li key={item.title_id} className="flex items-center gap-3 rounded bg-surface p-3">
              <span className="w-6 text-right text-sm text-zinc-500">{i + 1}</span>
              {poster ? (
                <Image
                  src={poster}
                  alt={item.titles.name}
                  width={36}
                  height={54}
                  className="rounded"
                />
              ) : (
                <div className="h-[54px] w-9 rounded bg-zinc-800" />
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/title/${item.titles.media_type}/${item.titles.tmdb_id}`}
                  className="font-medium hover:text-accent truncate"
                >
                  {item.titles.name}
                </Link>
                <p className="text-xs uppercase text-zinc-500">
                  {item.titles.media_type} · {item.titles.release_date?.slice(0, 4)}
                </p>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(i, -1)}
                    disabled={i === 0 || isPending}
                    className="rounded px-1.5 py-1 text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMove(i, 1)}
                    disabled={i === items.length - 1 || isPending}
                    className="rounded px-1.5 py-1 text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => handleRemove(item.title_id)}
                    className="ml-1 rounded px-2 py-1 text-xs text-zinc-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {canEdit && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Add titles</h3>
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies and TV…"
              className="flex-1 rounded border border-zinc-700 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded bg-zinc-700 px-3 py-2 text-sm hover:bg-zinc-600 disabled:opacity-50"
            >
              {searching ? '…' : 'Search'}
            </button>
          </form>
          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              {searchResults.slice(0, 8).map((r) => {
                const key = `${r.media_type}-${r.tmdb_id}`;
                const p = tmdbPosterUrl(r.poster_path);
                return (
                  <div key={key} className="flex items-center gap-3 rounded bg-surface p-2">
                    {p ? (
                      <Image src={p} alt={r.name} width={32} height={48} className="rounded" />
                    ) : (
                      <div className="h-12 w-8 rounded bg-zinc-800" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-zinc-500">
                        {r.media_type} · {r.release_date?.slice(0, 4)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(r)}
                      disabled={addingKey === key}
                      className="rounded bg-accent/80 px-2 py-1 text-xs font-medium text-black disabled:opacity-50"
                    >
                      {addingKey === key ? '…' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
