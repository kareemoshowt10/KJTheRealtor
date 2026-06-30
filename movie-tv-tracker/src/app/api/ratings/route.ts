import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RatingReason } from '@/lib/types';

interface RatingBody {
  title_id: string;
  score: number;
  reason?: RatingReason;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body: RatingBody = await request.json();

  if (typeof body.score !== 'number' || body.score < 0 || body.score > 10) {
    return NextResponse.json({ error: 'score must be between 0 and 10' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ratings')
    .insert({
      user_id: user.id,
      title_id: body.title_id,
      score: body.score,
      reason: body.reason ?? 'manual',
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to save rating' },
      { status: 500 }
    );
  }

  return NextResponse.json({ rating: data });
}
