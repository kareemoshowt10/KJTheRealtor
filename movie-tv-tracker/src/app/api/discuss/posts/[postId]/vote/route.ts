import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { vote }: { vote: 1 | -1 } = await request.json();
  if (vote !== 1 && vote !== -1) {
    return NextResponse.json({ error: 'vote must be 1 or -1' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('review_votes')
    .select('id, vote')
    .eq('voter_id', user.id)
    .eq('post_id', params.postId)
    .maybeSingle();

  if (existing) {
    if (existing.vote === vote) {
      // remove vote (toggle off)
      await supabase.from('review_votes').delete().eq('id', existing.id);
      return NextResponse.json({ vote: null });
    }
    // flip vote
    const { data } = await supabase
      .from('review_votes')
      .update({ vote })
      .eq('id', existing.id)
      .select()
      .single();
    return NextResponse.json({ vote: data?.vote });
  }

  // new vote
  const { data } = await supabase
    .from('review_votes')
    .insert({ voter_id: user.id, post_id: params.postId, vote })
    .select()
    .single();

  return NextResponse.json({ vote: data?.vote });
}
