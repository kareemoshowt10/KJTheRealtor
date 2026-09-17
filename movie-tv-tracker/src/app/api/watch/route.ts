import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { userTitleDocId } from '@/lib/firestore-ids';
import { resolveRuntime } from '@/lib/tmdb';
import { isDateKey } from '@/lib/dates';
import type { Title, UserTitle, WatchEvent } from '@/lib/types';

/** One request logs at most a season's worth of episodes. */
const MAX_EPISODES_PER_LOG = 60;

interface LogBody {
  title_id: string;
  /** Local YYYY-MM-DD from the client's own clock. */
  watched_date: string;
  watched_at?: string;
  season_number?: number | null;
  episode_number?: number | null;
  /** Inclusive end of an episode run, for logging a binge in one go. */
  through_episode?: number | null;
  is_rewatch?: boolean;
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body: LogBody = await request.json();

  if (!body.title_id || !isDateKey(body.watched_date)) {
    return NextResponse.json(
      { error: 'title_id and watched_date (YYYY-MM-DD) are required' },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const userTitleRef = db.collection('userTitles').doc(userTitleDocId(user.uid, body.title_id));
  const [userTitleSnap, titleSnap] = await Promise.all([
    userTitleRef.get(),
    db.collection('titles').doc(body.title_id).get(),
  ]);

  if (!userTitleSnap.exists || !titleSnap.exists) {
    return NextResponse.json({ error: 'Add this title to your library first' }, { status: 404 });
  }

  const userTitle = { id: userTitleSnap.id, ...userTitleSnap.data() } as UserTitle;
  const title = { id: titleSnap.id, ...titleSnap.data() } as Title;
  const isTv = title.media_type === 'tv';

  // Resolve which episodes this request covers. Movies are always a single event.
  let episodes: number[] = [];
  let season: number | null = null;

  if (isTv) {
    if (!isPositiveInt(body.season_number) || !isPositiveInt(body.episode_number)) {
      return NextResponse.json(
        { error: 'Season and episode are required for TV' },
        { status: 400 }
      );
    }
    season = body.season_number;
    const first = body.episode_number;
    const last = isPositiveInt(body.through_episode) ? body.through_episode : first;

    if (last < first) {
      return NextResponse.json(
        { error: 'The last episode must not come before the first' },
        { status: 400 }
      );
    }
    if (last - first + 1 > MAX_EPISODES_PER_LOG) {
      return NextResponse.json(
        { error: `Log at most ${MAX_EPISODES_PER_LOG} episodes at a time` },
        { status: 400 }
      );
    }
    for (let ep = first; ep <= last; ep++) episodes.push(ep);
  } else {
    episodes = [0]; // single sentinel pass for a movie
  }

  const runtime = resolveRuntime(title.media_type, title.runtime_minutes);
  const baseTime = body.watched_at ? new Date(body.watched_at) : new Date();
  if (Number.isNaN(baseTime.getTime())) {
    return NextResponse.json({ error: 'watched_at is not a valid date' }, { status: 400 });
  }

  const isRewatch = body.is_rewatch === true;
  const batch = db.batch();
  const created: WatchEvent[] = [];

  episodes.forEach((episode, index) => {
    const ref = db.collection('watchEvents').doc();
    // Nudge each event 1s apart so a batch-logged run keeps its episode order.
    const event: Omit<WatchEvent, 'id'> = {
      user_id: user.uid,
      title_id: title.id,
      media_type: title.media_type,
      watched_at: new Date(baseTime.getTime() + index * 1000).toISOString(),
      watched_date: body.watched_date,
      season_number: isTv ? season : null,
      episode_number: isTv ? episode : null,
      runtime_minutes: runtime,
      is_rewatch: isRewatch,
    };
    batch.set(ref, event);
    created.push({ id: ref.id, ...event });
  });

  // Keep the current-state pointers on userTitle consistent with the log, so the
  // rest of the app (rankings, planner, "continue watching") stays correct.
  const latest = created[created.length - 1];
  const patch: Record<string, unknown> = {
    last_watched_at: latest.watched_at,
    updated_at: new Date().toISOString(),
  };

  if (userTitle.status === 'watchlist') patch.status = 'watching';
  if (!userTitle.started_at) patch.started_at = latest.watched_at;
  if (isRewatch) patch.rewatch_count = (userTitle.rewatch_count ?? 0) + 1;

  if (isTv && season !== null) {
    // Only advance the pointer — logging an older episode shouldn't rewind progress.
    const ahead =
      userTitle.current_season == null ||
      season > userTitle.current_season ||
      (season === userTitle.current_season &&
        (userTitle.current_episode == null || latest.episode_number! > userTitle.current_episode));
    if (ahead) {
      patch.current_season = season;
      patch.current_episode = latest.episode_number;
    }
  }

  batch.update(userTitleRef, patch);
  await batch.commit();

  return NextResponse.json({ events: created, logged: created.length });
}
