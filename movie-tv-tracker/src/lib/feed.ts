import { getAdminDb } from './firebase/admin';
import { getDocsByIds, queryWhereIn } from './firestore-helpers';
import { getReputationMap, TRUSTED_REVIEWER_THRESHOLD } from './reputation';
import { followDocId } from './firestore-ids';
import type { ActivityEvent, Profile, Rating, Title, UserTitle } from './types';

export { TRUSTED_REVIEWER_THRESHOLD };

export async function getFollowingActivity(userId: string, limit = 40): Promise<ActivityEvent[]> {
  const db = getAdminDb();

  const followsSnap = await db.collection('follows').where('follower_id', '==', userId).get();
  const followeeIds = followsSnap.docs.map((d) => d.data().followee_id as string);
  if (followeeIds.length === 0) return [];

  const [ratings, statusChanges] = await Promise.all([
    queryWhereIn<Rating>(db, 'ratings', 'user_id', followeeIds, (q) =>
      q.orderBy('created_at', 'desc').limit(limit)
    ),
    queryWhereIn<UserTitle>(db, 'userTitles', 'user_id', followeeIds, (q) =>
      q.orderBy('updated_at', 'desc').limit(limit)
    ),
  ]);

  const titleIds = [...ratings.map((r) => r.title_id), ...statusChanges.map((s) => s.title_id)];
  const [titleMap, profileMap, repMap] = await Promise.all([
    getDocsByIds<Title>(db, 'titles', titleIds),
    getDocsByIds<Profile>(db, 'profiles', followeeIds),
    getReputationMap(followeeIds),
  ]);

  const events: ActivityEvent[] = [];

  for (const r of ratings) {
    const title = titleMap.get(r.title_id);
    const profile = profileMap.get(r.user_id);
    if (!title || !profile) continue;
    events.push({
      activity_type: 'rating',
      created_at: r.created_at,
      user_id: r.user_id,
      username: profile.username,
      title_id: r.title_id,
      title_name: title.name,
      media_type: title.media_type,
      tmdb_id: title.tmdb_id,
      poster_path: title.poster_path,
      metadata: String(r.score),
      is_trusted: (repMap.get(r.user_id) ?? 0) >= TRUSTED_REVIEWER_THRESHOLD,
    });
  }

  for (const ut of statusChanges) {
    const title = titleMap.get(ut.title_id);
    const profile = profileMap.get(ut.user_id);
    if (!title || !profile) continue;
    events.push({
      activity_type: 'watch_status',
      created_at: ut.updated_at,
      user_id: ut.user_id,
      username: profile.username,
      title_id: ut.title_id,
      title_name: title.name,
      media_type: title.media_type,
      tmdb_id: title.tmdb_id,
      poster_path: title.poster_path,
      metadata: ut.status,
      is_trusted: (repMap.get(ut.user_id) ?? 0) >= TRUSTED_REVIEWER_THRESHOLD,
    });
  }

  return events.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

export async function getFollowCounts(
  profileId: string
): Promise<{ followers: number; following: number }> {
  const db = getAdminDb();
  const [followersSnap, followingSnap] = await Promise.all([
    db.collection('follows').where('followee_id', '==', profileId).count().get(),
    db.collection('follows').where('follower_id', '==', profileId).count().get(),
  ]);
  return {
    followers: followersSnap.data().count,
    following: followingSnap.data().count,
  };
}

export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
  const db = getAdminDb();
  const doc = await db.collection('follows').doc(followDocId(followerId, followeeId)).get();
  return doc.exists;
}
