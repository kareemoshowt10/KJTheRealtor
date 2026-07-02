import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DiscussionTab } from '@/lib/types';

// GET /api/discuss/threads?title_id=…&tab=… — get or create the thread for a tab
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title_id = searchParams.get('title_id');
  const tab = searchParams.get('tab') as DiscussionTab | null;

  if (!title_id || !tab) {
    return NextResponse.json({ error: 'title_id and tab required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data: existing } = await supabase
    .from('discussion_threads')
    .select('*')
    .eq('title_id', title_id)
    .eq('tab', tab)
    .maybeSingle();

  if (existing) return NextResponse.json({ thread: existing });

  return NextResponse.json({ thread: null });
}

// POST /api/discuss/threads — upsert (get or create) a thread
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { title_id, tab }: { title_id: string; tab: DiscussionTab } = await request.json();

  const { data: existing } = await supabase
    .from('discussion_threads')
    .select('*')
    .eq('title_id', title_id)
    .eq('tab', tab)
    .maybeSingle();

  if (existing) return NextResponse.json({ thread: existing });

  const { data: thread, error } = await supabase
    .from('discussion_threads')
    .insert({ title_id, tab })
    .select()
    .single();

  if (error || !thread) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create thread' }, { status: 500 });
  }

  return NextResponse.json({ thread });
}
