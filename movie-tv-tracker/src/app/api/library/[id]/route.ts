import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { WatchStatus } from '@/lib/types';

interface UpdateBody {
  status?: WatchStatus;
  last_watched_at?: string | null;
  rewatch_count?: number;
  current_season?: number | null;
  current_episode?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body: UpdateBody = await request.json();

  const { data, error } = await supabase
    .from('user_titles')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to update library entry' },
      { status: 500 }
    );
  }

  return NextResponse.json({ userTitle: data });
}
