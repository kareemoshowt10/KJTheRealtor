import type { SupabaseClient } from '@supabase/supabase-js';
import type { CommunityEntry, CommunityStat, MediaType, Title } from './types';

/** Minimum distinct raters before a title's community score is shown with confidence. */
export const CONFIDENCE_THRESHOLD = 3;

const TRENDING_WINDOW_DAYS = 30;

export async function getCommunityRankings(
  supabase: SupabaseClient,
  options: { mediaType?: MediaType; trending?: boolean; limit?: number } = {}
): Promise<CommunityEntry[]> {
  const { mediaType, trending = false, limit = 20 } = options;

  let statQuery = supabase
    .from('title_community_stats')
    .select('*')
    .gte('rating_count', CONFIDENCE_THRESHOLD);

  if (trending) {
    const since = new Date();
    since.setDate(since.getDate() - TRENDING_WINDOW_DAYS);
    statQuery = statQuery.gte('last_rated_at', since.toISOString());
  }

  const { data: stats } = await statQuery
    .order('weighted_score', { ascending: false })
    .returns<CommunityStat[]>();

  if (!stats || stats.length === 0) return [];

  const titleIds = stats.map((s) => s.title_id);
  let titleQuery = supabase.from('titles').select('*').in('id', titleIds);
  if (mediaType) titleQuery = titleQuery.eq('media_type', mediaType);
  const { data: titles } = await titleQuery.returns<Title[]>();

  const titleMap = new Map((titles ?? []).map((t) => [t.id, t]));

  const entries: CommunityEntry[] = [];
  for (const stat of stats) {
    const title = titleMap.get(stat.title_id);
    if (!title) continue;
    entries.push({ title, stat });
  }

  return entries.slice(0, limit);
}
