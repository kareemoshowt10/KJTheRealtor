'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PostWithMeta } from '@/lib/types';

interface Props {
  post: PostWithMeta;
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export default function PostCard({ post, isAuthenticated, currentUserId }: Props) {
  const router = useRouter();
  const [netVotes, setNetVotes] = useState(post.net_votes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(post.user_vote);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthor = currentUserId !== null && currentUserId === post.user_id;

  async function handleVote(v: 1 | -1) {
    if (!isAuthenticated) return;
    const prev = userVote;
    const optimistic = userVote === v ? null : v;
    const delta = (optimistic ?? 0) - (prev ?? 0);
    setUserVote(optimistic);
    setNetVotes((n) => n + delta);

    const res = await fetch(`/api/discuss/posts/${post.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: v }),
    });
    if (!res.ok) {
      setUserVote(prev);
      setNetVotes((n) => n - delta);
    }
  }

  async function handleSaveEdit() {
    if (!editBody.trim()) {
      setError('Post cannot be empty');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/discuss/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update post');
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/discuss/posts/${post.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete post');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      setBusy(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
        <span className="font-medium text-zinc-200">{post.username}</span>
        {post.is_trusted && (
          <span className="rounded bg-amber-600/30 px-1.5 py-0.5 text-amber-400">
            ★ trusted
          </span>
        )}
        <span>·</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            className="input w-full resize-none"
            disabled={busy}
          />
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} disabled={busy} className="btn-primary px-3 py-1 text-xs">
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditBody(post.body);
                setError(null);
              }}
              disabled={busy}
              className="btn-ghost px-3 py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : post.has_spoilers && !showSpoiler ? (
        <div className="rounded border border-zinc-700 bg-zinc-900/60 p-3 text-sm">
          <p className="mb-2 text-zinc-400">⚠ Spoilers hidden</p>
          <button
            onClick={() => setShowSpoiler(true)}
            className="text-accent underline hover:no-underline"
          >
            Reveal
          </button>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-zinc-200">{post.body}</p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => handleVote(1)}
          disabled={!isAuthenticated}
          className={`text-sm transition-colors disabled:opacity-40 ${
            userVote === 1 ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ▲
        </button>
        <span className="text-sm text-zinc-400">{netVotes}</span>
        <button
          onClick={() => handleVote(-1)}
          disabled={!isAuthenticated}
          className={`text-sm transition-colors disabled:opacity-40 ${
            userVote === -1 ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ▼
        </button>

        {isAuthor && !isEditing && (
          <>
            <span className="mx-1 text-zinc-700">·</span>
            <button
              onClick={() => setIsEditing(true)}
              disabled={busy}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="text-xs text-zinc-500 hover:text-red-400"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
