import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; titleId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = getAdminDb();
  const listSnap = await db.collection('lists').doc(params.id).get();
  if (!listSnap.exists) return NextResponse.json({ error: 'List not found' }, { status: 404 });

  const list = listSnap.data()!;
  const canEdit = list.owner_id === user.uid || list.is_collaborative;
  if (!canEdit) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  await db.collection('listItems').doc(`${params.id}_${params.titleId}`).delete();

  return NextResponse.json({ deleted: true });
}
