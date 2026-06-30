import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MediaType, WatchStatus } from '@/lib/types';

interface AddTitleBody {
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
  status?: WatchStatus;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body: AddTitleBody = await request.json();

  const { data: title, error: titleError } = await supabase
    .from('titles')
    .upsert(
      {
        tmdb_id: body.tmdb_id,
        media_type: body.media_type,
        name: body.name,
        poster_path: body.poster_path,
        release_date: body.release_date,
        overview: body.overview,
      },
      { onConflict: 'tmdb_id,media_type' }
    )
    .select()
    .single();

  if (titleError || !title) {
    return NextResponse.json(
      { error: titleError?.message ?? 'Failed to cache title' },
      { status: 500 }
    );
  }

  const { data: userTitle, error: userTitleError } = await supabase
    .from('user_titles')
    .upsert(
      {
        user_id: user.id,
        title_id: title.id,
        status: body.status ?? 'watchlist',
      },
      { onConflict: 'user_id,title_id' }
    )
    .select()
    .single();

  if (userTitleError || !userTitle) {
    return NextResponse.json(
      { error: userTitleError?.message ?? 'Failed to add to library' },
      { status: 500 }
    );
  }

  return NextResponse.json({ title, userTitle });
}
