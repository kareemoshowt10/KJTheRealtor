import type { SupabaseClient } from '@supabase/supabase-js';
import { computeDynamicScore } from './scoring';
import type { RankedEntry, Rating, Title, UserTitle } from './types';

export async function getRankedLibrary(
  supabase: SupabaseClient,
  userId: string
): Promise<RankedEntry[]> {
  const { data: userTitles } = await supabase
    .from('user_titles')
    .select('*, titles(*)')
    .eq('user_id', userId)
    .returns<(UserTitle & { titles: Title })[]>();

  if (!userTitles || userTitles.length === 0) return [];

  const titleIds = userTitles.map((ut) => ut.title_id);

  const { data: ratingRows } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', userId)
    .in('title_id', titleIds)
    .order('created_at', { ascending: false })
    .returns<Rating[]>();

  const latestRatingByTitle = new Map<string, Rating>();
  for (const rating of ratingRows ?? []) {
    if (!latestRatingByTitle.has(rating.title_id)) {
      latestRatingByTitle.set(rating.title_id, rating);
    }
  }

  const entries: RankedEntry[] = userTitles.map((ut) => {
    const { titles: title, ...userTitle } = ut;
    const latestRating = latestRatingByTitle.get(userTitle.title_id) ?? null;
    return {
      userTitle,
      title,
      latestRating,
      dynamicScore: computeDynamicScore(userTitle, latestRating),
    };
  });

  return entries.sort((a, b) => (b.dynamicScore ?? -1) - (a.dynamicScore ?? -1));
}
