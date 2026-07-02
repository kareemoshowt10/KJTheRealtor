'use client';

import { useState } from 'react';
import type { PostWithMeta } from '@/lib/types';

interface Props {
  post: PostWithMeta;
  isAuthenticated: boolean;
}

export default function PostCard({ post, isAuthenticated }: Props) {
  const [netVotes, setNetVotes] = useState(post.net_votes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(post.user_vote);
  const [showSpoiler, setShowSpoiler] = useState(false);

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

  return (
    <div className="rounded bg-surface p-4">
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

      {post.has_spoilers && !showSpoiler ? (
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
      </div>
    </div>
  );
}
