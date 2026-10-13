import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import type { RatingReason } from '@/lib/types';

interface RatingBody {
  title_id: string;
  score: number;
  reason?: RatingReason;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body: RatingBody = await request.json();

  if (typeof body.score !== 'number' || body.score < 0 || body.score > 10) {
    return NextResponse.json({ error: 'score must be between 0 and 10' }, { status: 400 });
  }

  const data = {
    user_id: user.uid,
    title_id: body.title_id,
    score: body.score,
    reason: body.reason ?? 'manual',
    created_at: new Date().toISOString(),
  };

  const ref = await getAdminDb().collection('ratings').add(data);

  return NextResponse.json({ rating: { id: ref.id, ...data } });
}
