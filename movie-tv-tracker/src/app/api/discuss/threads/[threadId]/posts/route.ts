import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(request: Request, { params }: { params: { threadId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { body, has_spoilers }: { body: string; has_spoilers?: boolean } = await request.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: 'Post body cannot be empty' }, { status: 400 });
  }

  const data = {
    thread_id: params.threadId,
    user_id: user.uid,
    body: body.trim(),
    has_spoilers: has_spoilers ?? false,
    created_at: new Date().toISOString(),
  };

  const ref = await getAdminDb().collection('discussionPosts').add(data);

  return NextResponse.json({ post: { id: ref.id, ...data } });
}
