import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { titleDocId } from '@/lib/firestore-ids';
import { getOrNullThread, getPostsWithMeta } from '@/lib/discuss';
import { getTmdbSimilar, tmdbPosterUrl } from '@/lib/tmdb';
import PostCard from '@/components/PostCard';
import PostComposer from '@/components/PostComposer';
import type { DiscussionTab, MediaType, Title } from '@/lib/types';

const TABS: { key: DiscussionTab; label: string }[] = [
  { key: 'reviews', label: 'Reviews' },
  { key: 'episode_reactions', label: 'Episode Reactions' },
  { key: 'rankings_debate', label: 'Rankings Debate' },
  { key: 'similar_titles', label: 'Similar Titles' },
  { key: 'spoiler_talk', label: 'Spoiler Talk' },
];

interface Props {
  params: { type: string; tmdbId: string };
  searchParams: { tab?: string };
}

export default async function DiscussPage({ params, searchParams }: Props) {
  const mediaType = params.type as MediaType;
  if (mediaType !== 'movie' && mediaType !== 'tv') notFound();

  const tmdbId = Number(params.tmdbId);
  if (Number.isNaN(tmdbId)) notFound();

  const rawTab = searchParams.tab ?? 'reviews';
  const activeTab = (TABS.find((t) => t.key === rawTab)?.key ?? 'reviews') as DiscussionTab;

  const user = await getCurrentUser();

  const titleSnap = await getAdminDb().collection('titles').doc(titleDocId(mediaType, tmdbId)).get();
  const title = titleSnap.exists ? ({ id: titleSnap.id, ...titleSnap.data() } as Title) : null;

  if (!title) {
    return (
      <div className="text-zinc-400">
        <p>
          This title hasn&apos;t been added to any library yet.{' '}
          <Link href="/search" className="text-accent underline">
            Search for it
          </Link>{' '}
          to start a discussion.
        </p>
      </div>
    );
  }

  const titleHref = `/title/${mediaType}/${tmdbId}`;
  const baseHref = `${titleHref}/discuss`;
  const poster = tmdbPosterUrl(title.poster_path, 'w185');

  // Fetch content for active tab
  const isSimilar = activeTab === 'similar_titles';
  const [thread, similar] = await Promise.all([
    isSimilar ? Promise.resolve(null) : getOrNullThread(title.id, activeTab),
    isSimilar ? getTmdbSimilar(tmdbId, mediaType) : Promise.resolve([]),
  ]);

  const posts = thread ? await getPostsWithMeta(thread.id, user?.uid ?? null) : [];

  return (
    <div>
      <div className="mb-4 flex gap-4 border-b border-zinc-800 pb-3 text-sm">
        <Link href={titleHref} className="pb-3 text-zinc-400 hover:text-zinc-200">
          Overview
        </Link>
        <span className="border-b-2 border-accent pb-3 text-accent">Discuss</span>
      </div>

      <div className="mb-6 flex items-center gap-3">
        {poster && (
          <Image src={poster} alt={title.name} width={48} height={72} className="rounded" />
        )}
        <div>
          <Link href={titleHref} className="text-lg font-semibold hover:text-accent">
            {title.name}
          </Link>
          <p className="text-xs uppercase text-zinc-500">{mediaType}</p>
        </div>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`${baseHref}?tab=${t.key}`}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${
              t.key === activeTab
                ? 'border-accent text-accent'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {isSimilar ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {similar.length === 0 ? (
            <p className="col-span-full text-sm text-zinc-400">No similar titles found.</p>
          ) : (
            similar.map((s) => {
              const p = tmdbPosterUrl(s.poster_path);
              return (
                <Link
                  key={`${s.media_type}-${s.tmdb_id}`}
                  href={`/title/${s.media_type}/${s.tmdb_id}`}
                  className="rounded bg-surface p-2 hover:ring-1 hover:ring-accent"
                >
                  {p ? (
                    <Image
                      src={p}
                      alt={s.name}
                      width={185}
                      height={278}
                      className="mb-2 w-full rounded"
                    />
                  ) : (
                    <div className="mb-2 h-[160px] rounded bg-zinc-800" />
                  )}
                  <p className="text-xs font-medium">{s.name}</p>
                  <p className="text-xs text-zinc-500">{s.release_date?.slice(0, 4)}</p>
                </Link>
              );
            })
          )}
        </div>
      ) : (
        <div>
          {posts.length === 0 && (
            <p className="mb-4 text-sm text-zinc-400">
              No posts yet.{' '}
              {user ? (
                'Be the first.'
              ) : (
                <>
                  <Link href="/login" className="text-accent underline">
                    Log in
                  </Link>{' '}
                  to start the discussion.
                </>
              )}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isAuthenticated={!!user}
                currentUserId={user?.uid ?? null}
              />
            ))}
          </div>

          {user && (
            <PostComposer
              threadId={thread?.id ?? null}
              titleId={title.id}
              tab={activeTab}
            />
          )}
        </div>
      )}
    </div>
  );
}
