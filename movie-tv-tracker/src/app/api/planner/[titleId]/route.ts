import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { plannedWatchDocId } from '@/lib/firestore-ids';

export async function DELETE(_req: Request, { params }: { params: { titleId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  await getAdminDb().collection('plannedWatches').doc(plannedWatchDocId(user.uid, params.titleId)).delete();

  return NextResponse.json({ ok: true });
}
