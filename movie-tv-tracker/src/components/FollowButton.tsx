'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ targetUserId, initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`/api/follows/${targetUserId}`, { method });
    if (res.ok) {
      setIsFollowing(!isFollowing);
      startTransition(() => router.refresh());
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'border border-zinc-600 hover:border-red-500 hover:text-red-400'
          : 'bg-accent text-black hover:bg-orange-400'
      }`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
