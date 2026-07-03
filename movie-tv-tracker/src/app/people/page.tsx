import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TRUSTED_REVIEWER_THRESHOLD } from '@/lib/feed';
import FollowButton from '@/components/FollowButton';
import type { Profile } from '@/lib/types';

interface Props {
  searchParams: { q?: string };
}

export default async function PeoplePage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? '';

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileQuery = supabase.from('profiles').select('*').limit(20);
  if (query) {
    profileQuery = profileQuery.ilike('username', `%${query}%`);
  } else {
    profileQuery = profileQuery.order('created_at', { ascending: false });
  }
  const { data: profiles } = await profileQuery.returns<Profile[]>();

  const others = (profiles ?? []).filter((p) => p.id !== user?.id);
  const ids = others.map((p) => p.id);

  const [followerRows, myFollows, repRows] = await Promise.all([
    ids.length
      ? supabase.from('follows').select('followee_id').in('followee_id', ids)
      : Promise.resolve({ data: [] as { followee_id: string }[] }),
    user && ids.length
      ? supabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', user.id)
          .in('followee_id', ids)
      : Promise.resolve({ data: [] as { followee_id: string }[] }),
    ids.length
      ? supabase.from('user_reputation').select('user_id, net_votes').in('user_id', ids)
      : Promise.resolve({ data: [] as { user_id: string; net_votes: number }[] }),
  ]);

  const followerCounts = new Map<string, number>();
  for (const row of followerRows.data ?? []) {
    followerCounts.set(row.followee_id, (followerCounts.get(row.followee_id) ?? 0) + 1);
  }
  const followingSet = new Set((myFollows.data ?? []).map((r) => r.followee_id));
  const repMap = new Map((repRows.data ?? []).map((r) => [r.user_id, r.net_votes]));

  return (
    <div className="animate-fade-in-up">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">People</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Find people whose taste you trust and follow them to build your feed.
      </p>

      <form method="GET" className="mb-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by username…"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {!query && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Recently joined
        </p>
      )}

      {others.length === 0 ? (
        <div className="card p-6 text-center text-sm text-zinc-400">
          {query ? `No one matching “${query}” yet.` : 'No other members yet.'}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {others.map((profile) => {
            const followers = followerCounts.get(profile.id) ?? 0;
            const trusted = (repMap.get(profile.id) ?? 0) >= TRUSTED_REVIEWER_THRESHOLD;
            return (
              <li
                key={profile.id}
                className="card card-hover flex items-center justify-between gap-4 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-bold uppercase text-accent">
                    {profile.username.slice(0, 1)}
                  </div>
                  <div>
                    <Link
                      href={`/profile/${profile.username}`}
                      className="font-medium hover:text-accent"
                    >
                      {profile.username}
                    </Link>
                    {trusted && (
                      <span className="ml-1.5 rounded bg-amber-600/30 px-1 py-0.5 text-xs text-amber-400">
                        ★ trusted
                      </span>
                    )}
                    <p className="text-xs text-zinc-500">
                      {followers} follower{followers === 1 ? '' : 's'}
                      {profile.bio ? ` · ${profile.bio}` : ''}
                    </p>
                  </div>
                </div>
                {user && (
                  <FollowButton
                    targetUserId={profile.id}
                    initialIsFollowing={followingSet.has(profile.id)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
