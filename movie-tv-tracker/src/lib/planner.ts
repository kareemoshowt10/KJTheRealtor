import { getAdminDb } from './firebase/admin';
import { getDocsByIds } from './firestore-helpers';
import type { PlannedWatch, PlannerEntry, Title, UserTitle } from './types';

/** Titles eligible for the planner calendar — anything not yet finished. */
const PLANNABLE_STATUSES = ['watchlist', 'watching'] as const;

export async function getPlannerEntries(userId: string): Promise<PlannerEntry[]> {
  const db = getAdminDb();

  const [userTitlesSnap, plannedSnap] = await Promise.all([
    db
      .collection('userTitles')
      .where('user_id', '==', userId)
      .where('status', 'in', PLANNABLE_STATUSES)
      .get(),
    db.collection('plannedWatches').where('user_id', '==', userId).get(),
  ]);

  if (userTitlesSnap.empty) return [];

  const userTitles = userTitlesSnap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as object) }) as UserTitle
  );
  const titleMap = await getDocsByIds<Title>(
    db,
    'titles',
    userTitles.map((ut) => ut.title_id)
  );

  const scheduledByTitle = new Map<string, string>();
  for (const doc of plannedSnap.docs) {
    const data = doc.data() as PlannedWatch;
    scheduledByTitle.set(data.title_id, data.scheduled_date);
  }

  return userTitles
    .map((userTitle) => {
      const title = titleMap.get(userTitle.title_id);
      if (!title) return null;
      return {
        userTitle,
        title,
        scheduledDate: scheduledByTitle.get(userTitle.title_id) ?? null,
      };
    })
    .filter((e): e is PlannerEntry => e !== null);
}
