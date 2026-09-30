import { getAdminDb } from './firebase/admin';
import { getDocsByIds, queryWhereIn } from './firestore-helpers';
import { getReputationMap, TRUSTED_REVIEWER_THRESHOLD } from './reputation';
import { threadDocId } from './firestore-ids';
import type { DiscussionPost, DiscussionTab, DiscussionThread, PostWithMeta, Profile } from './types';

export async function getOrNullThread(
  titleId: string,
  tab: DiscussionTab
): Promise<DiscussionThread | null> {
  const snap = await getAdminDb().collection('discussionThreads').doc(threadDocId(titleId, tab)).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as object) } as DiscussionThread;
}

export async function getPostsWithMeta(
  threadId: string,
  currentUserId: string | null
): Promise<PostWithMeta[]> {
  const db = getAdminDb();

  const postsSnap = await db
    .collection('discussionPosts')
    .where('thread_id', '==', threadId)
    .orderBy('created_at', 'desc')
    .get();

  if (postsSnap.empty) return [];

  const posts = postsSnap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as object) }) as DiscussionPost
  );
  const postIds = posts.map((p) => p.id);
  const authorIds = [...new Set(posts.map((p) => p.user_id))];

  const [allVotes, profileMap, repMap] = await Promise.all([
    queryWhereIn<{ post_id: string; voter_id: string; vote: 1 | -1 }>(
      db,
      'reviewVotes',
      'post_id',
      postIds
    ),
    getDocsByIds<Profile>(db, 'profiles', authorIds),
    getReputationMap(authorIds),
  ]);

  const netVotesByPost = new Map<string, number>();
  const userVoteByPost = new Map<string, 1 | -1>();
  for (const v of allVotes) {
    netVotesByPost.set(v.post_id, (netVotesByPost.get(v.post_id) ?? 0) + v.vote);
    if (currentUserId && v.voter_id === currentUserId) {
      userVoteByPost.set(v.post_id, v.vote);
    }
  }

  const enriched: PostWithMeta[] = posts.map((post) => ({
    ...post,
    username: profileMap.get(post.user_id)?.username ?? 'unknown',
    net_votes: netVotesByPost.get(post.id) ?? 0,
    user_vote: userVoteByPost.get(post.id) ?? null,
    is_trusted: (repMap.get(post.user_id) ?? 0) >= TRUSTED_REVIEWER_THRESHOLD,
  }));

  return enriched.sort((a, b) => b.net_votes - a.net_votes);
}
