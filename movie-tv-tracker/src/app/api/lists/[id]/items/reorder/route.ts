import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';

interface ReorderItem {
  title_id: string;
  rank: number;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = getAdminDb();
  const listSnap = await db.collection('lists').doc(params.id).get();
  if (!listSnap.exists) return NextResponse.json({ error: 'List not found' }, { status: 404 });

  const list = listSnap.data()!;
  const canEdit = list.owner_id === user.uid || list.is_collaborative;
  if (!canEdit) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { items }: { items: ReorderItem[] } = await request.json();

  const batch = db.batch();
  for (const { title_id, rank } of items) {
    batch.update(db.collection('listItems').doc(`${params.id}_${title_id}`), { rank });
  }
  await batch.commit();

  return NextResponse.json({ reordered: true });
}
