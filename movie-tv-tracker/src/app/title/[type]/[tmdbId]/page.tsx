import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTmdbDetails } from '@/lib/tmdb';
import TitleDetail from '@/components/TitleDetail';
import type { MediaType, Rating, Title, UserTitle } from '@/lib/types';

interface Props {
  params: { type: string; tmdbId: string };
}

export default async function TitlePage({ params }: Props) {
  const mediaType = params.type as MediaType;
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    notFound();
  }

  const tmdbId = Number(params.tmdbId);
  if (Number.isNaN(tmdbId)) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cachedTitle } = await supabase
    .from('titles')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle<Title>();

  let userTitle: UserTitle | null = null;
  let ratings: Rating[] = [];

  if (cachedTitle && user) {
    const { data: ut } = await supabase
      .from('user_titles')
      .select('*')
      .eq('user_id', user.id)
      .eq('title_id', cachedTitle.id)
      .maybeSingle<UserTitle>();
    userTitle = ut;

    const { data: ratingRows } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', user.id)
      .eq('title_id', cachedTitle.id)
      .order('created_at', { ascending: false })
      .returns<Rating[]>();
    ratings = ratingRows ?? [];
  }

  if (cachedTitle) {
    return (
      <TitleDetail
        isAuthenticated={!!user}
        source={{ kind: 'cached', title: cachedTitle }}
        userTitle={userTitle}
        ratings={ratings}
      />
    );
  }

  try {
    const result = await getTmdbDetails(tmdbId, mediaType);
    return (
      <TitleDetail
        isAuthenticated={!!user}
        source={{ kind: 'live', result }}
        userTitle={null}
        ratings={[]}
      />
    );
  } catch {
    notFound();
  }
}
