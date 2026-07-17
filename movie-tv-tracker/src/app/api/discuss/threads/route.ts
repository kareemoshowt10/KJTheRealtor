import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { threadDocId } from '@/lib/firestore-ids';
import type { DiscussionTab } from '@/lib/types';

// GET /api/discuss/threads?title_id=…&tab=… — look up the thread for a tab
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title_id = searchParams.get('title_id');
  const tab = searchParams.get('tab') as DiscussionTab | null;

  if (!title_id || !tab) {
    return NextResponse.json({ error: 'title_id and tab required' }, { status: 400 });
  }

  const snap = await getAdminDb().collection('discussionThreads').doc(threadDocId(title_id, tab)).get();
  if (!snap.exists) return NextResponse.json({ thread: null });

  return NextResponse.json({ thread: { id: snap.id, ...snap.data() } });
}

// POST /api/discuss/threads — get or create a thread
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { title_id, tab }: { title_id: string; tab: DiscussionTab } = await request.json();

  const ref = getAdminDb().collection('discussionThreads').doc(threadDocId(title_id, tab));
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ thread: { id: existing.id, ...existing.data() } });
  }

  const data = { title_id, tab, created_at: new Date().toISOString() };
  await ref.set(data);

  return NextResponse.json({ thread: { id: ref.id, ...data } });
}
