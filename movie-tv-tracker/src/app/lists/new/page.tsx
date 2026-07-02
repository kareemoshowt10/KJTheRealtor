'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewListPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [status, setStatus] = useState<'idle' | 'creating' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setStatus('creating');
    setError(null);

    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, is_collaborative: isCollaborative }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Failed to create list');
      setStatus('error');
      return;
    }

    router.push(`/lists/${data.list.id}`);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">New list</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs uppercase text-zinc-500">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My favourite sci-fi"
            className="w-full rounded border border-zinc-700 bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase text-zinc-500">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded border border-zinc-700 bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isCollaborative}
            onChange={(e) => setIsCollaborative(e.target.checked)}
            className="accent-accent"
          />
          Allow others to add titles
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={status === 'creating' || !title.trim()}
          className="rounded bg-accent px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          {status === 'creating' ? 'Creating…' : 'Create list'}
        </button>
      </form>
    </div>
  );
}
