import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { body, has_spoilers }: { body: string; has_spoilers?: boolean } = await request.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: 'Post body cannot be empty' }, { status: 400 });
  }

  const { data: post, error } = await supabase
    .from('discussion_posts')
    .insert({
      thread_id: params.threadId,
      user_id: user.id,
      body: body.trim(),
      has_spoilers: has_spoilers ?? false,
    })
    .select()
    .single();

  if (error || !post) {
    return NextResponse.json({ error: error?.message ?? 'Failed to save post' }, { status: 500 });
  }

  return NextResponse.json({ post });
}
