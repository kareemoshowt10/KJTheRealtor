import { getAdminDb } from './firebase/admin';
import { getDocsByIds } from './firestore-helpers';
import { getReputationMap, TRUSTED_REVIEWER_THRESHOLD } from './reputation';
import type { CommunityEntry, CommunityStat, MediaType, Rating, Title } from './types';

/** Minimum distinct raters before a title's community score is shown with confidence. */
export const CONFIDENCE_THRESHOLD = 3;

/**
 * Cap on ratings scanned for community aggregation. Firestore has no
 * server-side GROUP BY, so this aggregates in application code over a
 * recency-biased window rather than the full ratings history — fine at
 * MVP scale; revisit with a scheduled rollup (e.g. a Cloud Function) if
 * the ratings collection grows large.
 */
const RATINGS_SCAN_LIMIT = 3000;
const TRENDING_WINDOW_DAYS = 30;

export async function getCommunityRankings(
  options: { mediaType?: MediaType; trending?: boolean; limit?: number } = {}
): Promise<CommunityEntry[]> {
  const { mediaType, trending = false, limit = 20 } = options;
  const db = getAdminDb();

  const ratingsSnap = await db
    .collection('ratings')
    .orderBy('created_at', 'desc')
    .limit(RATINGS_SCAN_LIMIT)
    .get();

  const allRatings = ratingsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Rating);
  if (allRatings.length === 0) return [];

  // Latest rating per (user, title) — mirrors the old latest_ratings view.
  const latestByUserTitle = new Map<string, Rating>();
  for (const r of allRatings) {
    const key = `${r.user_id}_${r.title_id}`;
    const existing = latestByUserTitle.get(key);
    if (!existing || r.created_at > existing.created_at) {
      latestByUserTitle.set(key, r);
    }
  }
  const latestRatings = [...latestByUserTitle.values()];

  const raterIds = [...new Set(latestRatings.map((r) => r.user_id))];
  const repMap = await getReputationMap(raterIds);

  const byTitle = new Map<string, { scores: number[]; weights: number[]; lastRatedAt: string }>();
  for (const r of latestRatings) {
    const weight = (repMap.get(r.user_id) ?? 0) >= TRUSTED_REVIEWER_THRESHOLD ? 1.5 : 1;
    const bucket = byTitle.get(r.title_id) ?? {
      scores: [],
      weights: [],
      lastRatedAt: r.created_at,
    };
    bucket.scores.push(r.score);
    bucket.weights.push(weight);
    if (r.created_at > bucket.lastRatedAt) bucket.lastRatedAt = r.created_at;
    byTitle.set(r.title_id, bucket);
  }

  const since = trending ? Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000 : null;

  const stats: CommunityStat[] = [];
  for (const [titleId, bucket] of byTitle) {
    if (bucket.scores.length < CONFIDENCE_THRESHOLD) continue;
    if (since !== null && new Date(bucket.lastRatedAt).getTime() < since) continue;

    const weightedSum = bucket.scores.reduce((sum, s, i) => sum + s * bucket.weights[i], 0);
    const weightTotal = bucket.weights.reduce((sum, w) => sum + w, 0);
    const avg = bucket.scores.reduce((sum, s) => sum + s, 0) / bucket.scores.length;

    stats.push({
      title_id: titleId,
      rating_count: bucket.scores.length,
      avg_score: Number(avg.toFixed(2)),
      weighted_score: Number((weightedSum / weightTotal).toFixed(2)),
      last_rated_at: bucket.lastRatedAt,
    });
  }

  stats.sort((a, b) => b.weighted_score - a.weighted_score);

  const titleMap = await getDocsByIds<Title>(
    db,
    'titles',
    stats.map((s) => s.title_id)
  );

  const entries: CommunityEntry[] = [];
  for (const stat of stats) {
    const title = titleMap.get(stat.title_id);
    if (!title) continue;
    if (mediaType && title.media_type !== mediaType) continue;
    entries.push({ title, stat });
    if (entries.length >= limit) break;
  }

  return entries;
}
