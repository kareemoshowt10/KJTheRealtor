import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { voteDocId } from '@/lib/firestore-ids';

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { vote }: { vote: 1 | -1 } = await request.json();
  if (vote !== 1 && vote !== -1) {
    return NextResponse.json({ error: 'vote must be 1 or -1' }, { status: 400 });
  }

  const ref = getAdminDb().collection('reviewVotes').doc(voteDocId(user.uid, params.postId));
  const existing = await ref.get();

  if (existing.exists) {
    if (existing.data()?.vote === vote) {
      // remove vote (toggle off)
      await ref.delete();
      return NextResponse.json({ vote: null });
    }
    // flip vote
    await ref.update({ vote });
    return NextResponse.json({ vote });
  }

  // new vote
  await ref.set({
    voter_id: user.uid,
    post_id: params.postId,
    vote,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ vote });
}
