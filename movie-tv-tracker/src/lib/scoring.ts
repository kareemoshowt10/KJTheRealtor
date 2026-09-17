import type { Rating, UserTitle } from './types';

const RECENCY_WINDOW_DAYS = 90;
const MAX_RECENCY_BOOST = 0.5;
const WATCHING_DAMP_FACTOR = 0.9;
const REWATCH_WEIGHT_PER_REWATCH = 0.1;
const MAX_REWATCH_BOOST = 0.5;

function recencyBoost(lastWatchedAt: string | null): number {
  if (!lastWatchedAt) return 0;
  const daysSince =
    (Date.now() - new Date(lastWatchedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince >= RECENCY_WINDOW_DAYS) return 0;
  const fraction = 1 - daysSince / RECENCY_WINDOW_DAYS;
  return Number((fraction * MAX_RECENCY_BOOST).toFixed(2));
}

function completionModifier(status: UserTitle['status'], score: number): number {
  if (status === 'watching') return Number((-score * (1 - WATCHING_DAMP_FACTOR)).toFixed(2));
  return 0;
}

function rewatchWeight(rewatchCount: number): number {
  return Math.min(rewatchCount * REWATCH_WEIGHT_PER_REWATCH, MAX_REWATCH_BOOST);
}

/**
 * dynamic_score = latest rating + recency boost + completion modifier + rewatch weight,
 * clamped to [0, 10]. Returns null when there's no rating yet.
 */
export function computeDynamicScore(
  userTitle: UserTitle,
  latestRating: Rating | null
): number | null {
  if (!latestRating) return null;

  const base = latestRating.score;
  const total =
    base +
    recencyBoost(userTitle.last_watched_at) +
    completionModifier(userTitle.status, base) +
    rewatchWeight(userTitle.rewatch_count);

  return Number(Math.min(10, Math.max(0, total)).toFixed(1));
}
