import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const ref = getAdminDb().collection('lists').doc(params.id);
  const snap = await ref.get();

  if (!snap.exists || snap.data()?.owner_id !== user.uid) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
  }

  await ref.update(body);
  const updated = await ref.get();

  return NextResponse.json({ list: { id: updated.id, ...updated.data() } });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = getAdminDb();
  const ref = db.collection('lists').doc(params.id);
  const snap = await ref.get();

  if (!snap.exists || snap.data()?.owner_id !== user.uid) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
  }

  const itemsSnap = await db.collection('listItems').where('list_id', '==', params.id).get();
  const batch = db.batch();
  itemsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();

  return NextResponse.json({ deleted: true });
}
