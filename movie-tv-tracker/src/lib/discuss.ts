import type { SupabaseClient } from '@supabase/supabase-js';
import type { DiscussionPost, DiscussionThread, PostWithMeta } from './types';
import { TRUSTED_REVIEWER_THRESHOLD } from './feed';

export async function getOrNullThread(
  supabase: SupabaseClient,
  titleId: string,
  tab: string
): Promise<DiscussionThread | null> {
  const { data } = await supabase
    .from('discussion_threads')
    .select('*')
    .eq('title_id', titleId)
    .eq('tab', tab)
    .maybeSingle<DiscussionThread>();
  return data;
}

export async function getPostsWithMeta(
  supabase: SupabaseClient,
  threadId: string,
  currentUserId: string | null
): Promise<PostWithMeta[]> {
  const { data: posts } = await supabase
    .from('discussion_posts')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: false })
    .returns<DiscussionPost[]>();

  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const authorIds = [...new Set(posts.map((p) => p.user_id))];

  const [{ data: allVotes }, { data: reputations }, { data: profiles }] = await Promise.all([
    supabase.from('review_votes').select('post_id, voter_id, vote').in('post_id', postIds),
    supabase
      .from('user_reputation')
      .select('user_id, net_votes')
      .in('user_id', authorIds),
    supabase.from('profiles').select('id, username').in('id', authorIds),
  ]);

  const netVotesByPost = new Map<string, number>();
  const userVoteByPost = new Map<string, 1 | -1>();
  for (const v of allVotes ?? []) {
    netVotesByPost.set(v.post_id, (netVotesByPost.get(v.post_id) ?? 0) + v.vote);
    if (currentUserId && v.voter_id === currentUserId) {
      userVoteByPost.set(v.post_id, v.vote as 1 | -1);
    }
  }

  const repByUser = new Map<string, number>();
  for (const r of reputations ?? []) {
    repByUser.set(r.user_id, r.net_votes);
  }

  const usernameByUser = new Map<string, string>();
  for (const p of profiles ?? []) {
    usernameByUser.set(p.id, p.username);
  }

  const enriched: PostWithMeta[] = posts.map((post) => ({
    ...post,
    username: usernameByUser.get(post.user_id) ?? 'unknown',
    net_votes: netVotesByPost.get(post.id) ?? 0,
    user_vote: userVoteByPost.get(post.id) ?? null,
    is_trusted: (repByUser.get(post.user_id) ?? 0) >= TRUSTED_REVIEWER_THRESHOLD,
  }));

  return enriched.sort((a, b) => b.net_votes - a.net_votes);
}
