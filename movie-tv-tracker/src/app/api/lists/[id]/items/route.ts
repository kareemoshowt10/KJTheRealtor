import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MediaType } from '@/lib/types';

interface AddItemBody {
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: list } = await supabase
    .from('lists')
    .select('id, owner_id, is_collaborative')
    .eq('id', params.id)
    .maybeSingle();

  if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });

  const canAdd = list.owner_id === user.id || list.is_collaborative;
  if (!canAdd) return NextResponse.json({ error: 'Not authorized to edit this list' }, { status: 403 });

  const body: AddItemBody = await request.json();

  // Upsert title into titles cache
  const { data: title, error: titleErr } = await supabase
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

  if (titleErr || !title) {
    return NextResponse.json({ error: titleErr?.message ?? 'Failed to cache title' }, { status: 500 });
  }

  // Get current max rank in the list
  const { data: existing } = await supabase
    .from('list_items')
    .select('rank')
    .eq('list_id', params.id)
    .order('rank', { ascending: false })
    .limit(1);

  const nextRank = existing && existing.length > 0 ? existing[0].rank + 1 : 1;

  const { data: item, error: itemErr } = await supabase
    .from('list_items')
    .insert({
      list_id: params.id,
      title_id: title.id,
      rank: nextRank,
      added_by: user.id,
    })
    .select()
    .single();

  if (itemErr || !item) {
    if (itemErr?.code === '23505') {
      return NextResponse.json({ error: 'Title already in this list' }, { status: 409 });
    }
    return NextResponse.json({ error: itemErr?.message ?? 'Failed to add item' }, { status: 500 });
  }

  return NextResponse.json({ item, title });
}
