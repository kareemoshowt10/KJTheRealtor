import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';

export async function DELETE(_req: Request, { params }: { params: { eventId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = getAdminDb();
  const ref = db.collection('watchEvents').doc(params.eventId);
  const snap = await ref.get();

  if (!snap.exists || snap.data()?.user_id !== user.uid) {
    return NextResponse.json({ error: 'Watch entry not found' }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
