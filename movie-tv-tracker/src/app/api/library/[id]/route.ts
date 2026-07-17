import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import type { WatchStatus } from '@/lib/types';

interface UpdateBody {
  status?: WatchStatus;
  last_watched_at?: string | null;
  rewatch_count?: number;
  current_season?: number | null;
  current_episode?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body: UpdateBody = await request.json();
  const db = getAdminDb();
  const ref = db.collection('userTitles').doc(params.id);
  const snap = await ref.get();

  if (!snap.exists || snap.data()?.user_id !== user.uid) {
    return NextResponse.json({ error: 'Failed to update library entry' }, { status: 404 });
  }

  await ref.update({ ...body, updated_at: new Date().toISOString() });
  const updated = await ref.get();

  return NextResponse.json({ userTitle: { id: updated.id, ...updated.data() } });
}
