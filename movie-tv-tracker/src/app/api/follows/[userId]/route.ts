import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { followDocId } from '@/lib/firestore-ids';

export async function POST(_req: Request, { params }: { params: { userId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (user.uid === params.userId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }

  const ref = getAdminDb().collection('follows').doc(followDocId(user.uid, params.userId));
  await ref.set(
    {
      follower_id: user.uid,
      followee_id: params.userId,
      created_at: new Date().toISOString(),
    },
    { merge: true }
  );

  return NextResponse.json({ following: true });
}

export async function DELETE(_req: Request, { params }: { params: { userId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  await getAdminDb().collection('follows').doc(followDocId(user.uid, params.userId)).delete();

  return NextResponse.json({ following: false });
}
