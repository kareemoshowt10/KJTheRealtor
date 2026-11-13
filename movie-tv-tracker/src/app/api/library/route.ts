import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { titleDocId, userTitleDocId } from '@/lib/firestore-ids';
import { getTmdbDetails } from '@/lib/tmdb';
import type { MediaType, WatchStatus } from '@/lib/types';

interface AddTitleBody {
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
  runtime_minutes?: number | null;
  status?: WatchStatus;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body: AddTitleBody = await request.json();
  const db = getAdminDb();
  const now = new Date().toISOString();

  const titleId = titleDocId(body.media_type, body.tmdb_id);
  const titleRef = db.collection('titles').doc(titleId);

  // Runtime drives every hours-watched figure, so backfill it from TMDB when the
  // client didn't have it (search results don't carry runtime, only detail lookups do).
  let runtimeMinutes = body.runtime_minutes ?? null;
  if (runtimeMinutes == null) {
    try {
      runtimeMinutes = (await getTmdbDetails(body.tmdb_id, body.media_type)).runtime_minutes;
    } catch {
      runtimeMinutes = null;
    }
  }

  await titleRef.set(
    {
      tmdb_id: body.tmdb_id,
      media_type: body.media_type,
      name: body.name,
      poster_path: body.poster_path,
      release_date: body.release_date,
      overview: body.overview,
      runtime_minutes: runtimeMinutes,
      created_at: now,
    },
    { merge: true }
  );
  const title = { id: titleId, ...(await titleRef.get()).data() };

  const userTitleId = userTitleDocId(user.uid, titleId);
  const userTitleRef = db.collection('userTitles').doc(userTitleId);
  const existing = await userTitleRef.get();

  if (!existing.exists) {
    await userTitleRef.set({
      user_id: user.uid,
      title_id: titleId,
      status: body.status ?? 'watchlist',
      last_watched_at: null,
      rewatch_count: 0,
      current_season: null,
      current_episode: null,
      started_at: null,
      completed_at: null,
      created_at: now,
      updated_at: now,
    });
  }

  const userTitleSnap = await userTitleRef.get();
  const userTitle = { id: userTitleId, ...userTitleSnap.data() };

  return NextResponse.json({ title, userTitle });
}
