import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { titleDocId } from '@/lib/firestore-ids';
import type { MediaType } from '@/lib/types';

interface AddItemBody {
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = getAdminDb();
  const listSnap = await db.collection('lists').doc(params.id).get();
  if (!listSnap.exists) return NextResponse.json({ error: 'List not found' }, { status: 404 });

  const list = listSnap.data()!;
  const canAdd = list.owner_id === user.uid || list.is_collaborative;
  if (!canAdd) return NextResponse.json({ error: 'Not authorized to edit this list' }, { status: 403 });

  const body: AddItemBody = await request.json();

  const titleId = titleDocId(body.media_type, body.tmdb_id);
  const titleRef = db.collection('titles').doc(titleId);
  await titleRef.set(
    {
      tmdb_id: body.tmdb_id,
      media_type: body.media_type,
      name: body.name,
      poster_path: body.poster_path,
      release_date: body.release_date,
      overview: body.overview,
      created_at: new Date().toISOString(),
    },
    { merge: true }
  );
  const title = { id: titleId, ...(await titleRef.get()).data() };

  const maxRankSnap = await db
    .collection('listItems')
    .where('list_id', '==', params.id)
    .orderBy('rank', 'desc')
    .limit(1)
    .get();
  const nextRank = maxRankSnap.empty ? 1 : (maxRankSnap.docs[0].data().rank as number) + 1;

  const itemRef = db.collection('listItems').doc(`${params.id}_${titleId}`);
  const itemData = {
    list_id: params.id,
    title_id: titleId,
    rank: nextRank,
    added_by: user.uid,
  };

  try {
    await itemRef.create(itemData);
  } catch {
    return NextResponse.json({ error: 'Title already in this list' }, { status: 409 });
  }

  return NextResponse.json({ item: itemData, title });
}
