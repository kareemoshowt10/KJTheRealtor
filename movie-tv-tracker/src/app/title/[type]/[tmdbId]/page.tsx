import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { titleDocId, userTitleDocId } from '@/lib/firestore-ids';
import { getTmdbDetails } from '@/lib/tmdb';
import TitleDetail from '@/components/TitleDetail';
import type { MediaType, Rating, Title, UserTitle } from '@/lib/types';

interface Props {
  params: { type: string; tmdbId: string };
}

export default async function TitlePage({ params }: Props) {
  const mediaType = params.type as MediaType;
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    notFound();
  }

  const tmdbId = Number(params.tmdbId);
  if (Number.isNaN(tmdbId)) {
    notFound();
  }

  const user = await getCurrentUser();
  const db = getAdminDb();

  const titleId = titleDocId(mediaType, tmdbId);
  const titleSnap = await db.collection('titles').doc(titleId).get();
  const cachedTitle = titleSnap.exists ? ({ id: titleSnap.id, ...titleSnap.data() } as Title) : null;

  let userTitle: UserTitle | null = null;
  let ratings: Rating[] = [];

  if (cachedTitle && user) {
    const userTitleSnap = await db
      .collection('userTitles')
      .doc(userTitleDocId(user.uid, cachedTitle.id))
      .get();
    userTitle = userTitleSnap.exists
      ? ({ id: userTitleSnap.id, ...userTitleSnap.data() } as UserTitle)
      : null;

    const ratingsSnap = await db
      .collection('ratings')
      .where('user_id', '==', user.uid)
      .where('title_id', '==', cachedTitle.id)
      .orderBy('created_at', 'desc')
      .get();
    ratings = ratingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Rating);
  }

  const discussHref = `/title/${mediaType}/${tmdbId}/discuss`;

  if (cachedTitle) {
    return (
      <>
        <div className="mb-4 flex gap-4 border-b border-zinc-800 pb-3 text-sm">
          <span className="border-b-2 border-accent pb-3 text-accent">Overview</span>
          <Link href={discussHref} className="pb-3 text-zinc-400 hover:text-zinc-200">
            Discuss
          </Link>
        </div>
        <TitleDetail
          isAuthenticated={!!user}
          source={{ kind: 'cached', title: cachedTitle }}
          userTitle={userTitle}
          ratings={ratings}
        />
      </>
    );
  }

  try {
    const result = await getTmdbDetails(tmdbId, mediaType);
    return (
      <TitleDetail
        isAuthenticated={!!user}
        source={{ kind: 'live', result }}
        userTitle={null}
        ratings={[]}
      />
    );
  } catch {
    notFound();
  }
}
