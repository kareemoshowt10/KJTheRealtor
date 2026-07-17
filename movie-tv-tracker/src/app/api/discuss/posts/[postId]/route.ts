import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, { params }: { params: { postId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { body, has_spoilers }: { body?: string; has_spoilers?: boolean } = await request.json();
  if (body !== undefined && !body.trim()) {
    return NextResponse.json({ error: 'Post body cannot be empty' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body !== undefined) patch.body = body.trim();
  if (has_spoilers !== undefined) patch.has_spoilers = has_spoilers;

  const { data, error } = await supabase
    .from('discussion_posts')
    .update(patch)
    .eq('id', params.postId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Failed to update post' }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(_request: Request, { params }: { params: { postId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { error, count } = await supabase
    .from('discussion_posts')
    .delete({ count: 'exact' })
    .eq('id', params.postId)
    .eq('user_id', user.id);

  if (error || !count) {
    return NextResponse.json({ error: error?.message ?? 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
