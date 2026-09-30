import { getAdminDb } from './firebase/admin';
import { getDocsByIds, queryWhereIn } from './firestore-helpers';
import { computeDynamicScore } from './scoring';
import type { RankedEntry, Rating, Title, UserTitle } from './types';

export async function getRankedLibrary(userId: string): Promise<RankedEntry[]> {
  const db = getAdminDb();

  const userTitlesSnap = await db.collection('userTitles').where('user_id', '==', userId).get();
  if (userTitlesSnap.empty) return [];

  const userTitles = userTitlesSnap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as object) }) as UserTitle
  );
  const titleIds = userTitles.map((ut) => ut.title_id);

  const [titleMap, ratings] = await Promise.all([
    getDocsByIds<Title>(db, 'titles', titleIds),
    queryWhereIn<Rating>(db, 'ratings', 'title_id', titleIds, (q) =>
      q.where('user_id', '==', userId)
    ),
  ]);

  const latestRatingByTitle = new Map<string, Rating>();
  for (const rating of ratings.sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    if (!latestRatingByTitle.has(rating.title_id)) {
      latestRatingByTitle.set(rating.title_id, rating);
    }
  }

  const entries: RankedEntry[] = userTitles
    .map((userTitle) => {
      const title = titleMap.get(userTitle.title_id);
      if (!title) return null;
      const latestRating = latestRatingByTitle.get(userTitle.title_id) ?? null;
      return {
        userTitle,
        title,
        latestRating,
        dynamicScore: computeDynamicScore(userTitle, latestRating),
      };
    })
    .filter((e): e is RankedEntry => e !== null);

  return entries.sort((a, b) => (b.dynamicScore ?? -1) - (a.dynamicScore ?? -1));
}
