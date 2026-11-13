import { getAdminDb } from './firebase/admin';
import { queryWhereIn } from './firestore-helpers';

/** Trusted reviewer threshold: net votes across a user's discussion posts. */
export const TRUSTED_REVIEWER_THRESHOLD = 10;

/** Sum of votes received across all of a user's discussion posts, per user. */
export async function getReputationMap(userIds: string[]): Promise<Map<string, number>> {
  const db = getAdminDb();
  const uniqueIds = [...new Set(userIds)];
  const repMap = new Map<string, number>(uniqueIds.map((id) => [id, 0]));
  if (uniqueIds.length === 0) return repMap;

  const posts = await queryWhereIn<{ id: string; user_id: string }>(
    db,
    'discussionPosts',
    'user_id',
    uniqueIds
  );
  if (posts.length === 0) return repMap;

  const postIds = posts.map((p) => p.id);
  const votes = await queryWhereIn<{ post_id: string; vote: number }>(
    db,
    'reviewVotes',
    'post_id',
    postIds
  );

  const netByPost = new Map<string, number>();
  for (const v of votes) {
    netByPost.set(v.post_id, (netByPost.get(v.post_id) ?? 0) + v.vote);
  }

  for (const post of posts) {
    const net = netByPost.get(post.id) ?? 0;
    repMap.set(post.user_id, (repMap.get(post.user_id) ?? 0) + net);
  }

  return repMap;
}
