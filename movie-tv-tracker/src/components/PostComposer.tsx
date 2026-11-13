'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  /** Pass existing threadId, or null to auto-create on first post. */
  threadId: string | null;
  /** Required when threadId is null — used to create the thread. */
  titleId?: string;
  tab?: string;
}

export default function PostComposer({ threadId, titleId, tab }: Props) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [status, setStatus] = useState<'idle' | 'posting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setStatus('posting');
    setErrorMsg(null);

    let resolvedThreadId = threadId;

    if (!resolvedThreadId) {
      if (!titleId || !tab) {
        setErrorMsg('Missing thread context');
        setStatus('error');
        return;
      }
      const res = await fetch('/api/discuss/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title_id: titleId, tab }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErrorMsg(d.error ?? 'Failed to create thread');
        setStatus('error');
        return;
      }
      resolvedThreadId = d.thread.id;
    }

    const res = await fetch(`/api/discuss/threads/${resolvedThreadId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, has_spoilers: hasSpoilers }),
    });

    if (!res.ok) {
      const d = await res.json();
      setErrorMsg(d.error ?? 'Failed to post');
      setStatus('error');
      return;
    }

    setBody('');
    setHasSpoilers(false);
    setStatus('idle');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts…"
        rows={3}
        className="w-full resize-none rounded border border-zinc-700 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="mt-2 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={hasSpoilers}
            onChange={(e) => setHasSpoilers(e.target.checked)}
            className="accent-accent"
          />
          Contains spoilers
        </label>
        <button
          type="submit"
          disabled={status === 'posting' || !body.trim()}
          className="ml-auto rounded bg-accent px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
        >
          {status === 'posting' ? 'Posting…' : 'Post'}
        </button>
      </div>
      {errorMsg && <p className="mt-1 text-xs text-red-400">{errorMsg}</p>}
    </form>
  );
}
