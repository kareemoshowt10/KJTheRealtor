import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { plannedWatchDocId, userTitleDocId } from '@/lib/firestore-ids';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { title_id, scheduled_date }: { title_id?: string; scheduled_date?: string } =
    await request.json();

  if (!title_id || !scheduled_date || !DATE_RE.test(scheduled_date)) {
    return NextResponse.json(
      { error: 'title_id and scheduled_date (YYYY-MM-DD) are required' },
      { status: 400 }
    );
  }

  const db = getAdminDb();

  // Only titles already in the user's library can be scheduled.
  const userTitleSnap = await db.collection('userTitles').doc(userTitleDocId(user.uid, title_id)).get();
  if (!userTitleSnap.exists) {
    return NextResponse.json({ error: 'Add this title to your library first' }, { status: 404 });
  }

  const data = {
    user_id: user.uid,
    title_id,
    scheduled_date,
    created_at: new Date().toISOString(),
  };

  await db
    .collection('plannedWatches')
    .doc(plannedWatchDocId(user.uid, title_id))
    .set(data, { merge: true });

  return NextResponse.json({ plannedWatch: data });
}
