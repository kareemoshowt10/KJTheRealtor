import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';

export async function PATCH(request: Request, { params }: { params: { postId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { body, has_spoilers }: { body?: string; has_spoilers?: boolean } = await request.json();
  if (body !== undefined && !body.trim()) {
    return NextResponse.json({ error: 'Post body cannot be empty' }, { status: 400 });
  }

  const ref = getAdminDb().collection('discussionPosts').doc(params.postId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.user_id !== user.uid) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};
  if (body !== undefined) patch.body = body.trim();
  if (has_spoilers !== undefined) patch.has_spoilers = has_spoilers;

  await ref.update(patch);
  const updated = await ref.get();

  return NextResponse.json({ post: { id: updated.id, ...updated.data() } });
}

export async function DELETE(_request: Request, { params }: { params: { postId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = getAdminDb();
  const ref = db.collection('discussionPosts').doc(params.postId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.user_id !== user.uid) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Clean up votes on this post too (no FK cascade in Firestore).
  const votesSnap = await db.collection('reviewVotes').where('post_id', '==', params.postId).get();
  const batch = db.batch();
  votesSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();

  return NextResponse.json({ ok: true });
}
