import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActivityEvent } from './types';

export const TRUSTED_REVIEWER_THRESHOLD = 10;

export async function getFollowingActivity(
  supabase: SupabaseClient,
  userId: string,
  limit = 40
): Promise<ActivityEvent[]> {
  const { data: follows } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', userId);

  const followeeIds = (follows ?? []).map((f) => f.followee_id);
  if (followeeIds.length === 0) return [];

  const [{ data: events }, { data: repRows }] = await Promise.all([
    supabase
      .from('following_activity')
      .select('*')
      .in('user_id', followeeIds)
      .order('created_at', { ascending: false })
      .limit(limit)
      .returns<ActivityEvent[]>(),
    supabase
      .from('user_reputation')
      .select('user_id, net_votes')
      .in('user_id', followeeIds),
  ]);

  const repMap = new Map<string, number>();
  for (const r of repRows ?? []) {
    repMap.set(r.user_id, r.net_votes);
  }

  return (events ?? []).map((e) => ({
    ...e,
    is_trusted: (repMap.get(e.user_id) ?? 0) >= TRUSTED_REVIEWER_THRESHOLD,
  }));
}

export async function getFollowCounts(
  supabase: SupabaseClient,
  profileId: string
): Promise<{ followers: number; following: number }> {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('followee_id', profileId),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profileId),
  ]);

  return { followers: followers ?? 0, following: following ?? 0 };
}

export async function isFollowing(
  supabase: SupabaseClient,
  followerId: string,
  followeeId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .maybeSingle();
  return !!data;
}
