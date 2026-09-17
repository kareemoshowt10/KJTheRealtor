import Link from 'next/link';
import { getCommunityRankings, CONFIDENCE_THRESHOLD } from '@/lib/discover';
import CommunityList from '@/components/CommunityList';
import type { MediaType } from '@/lib/types';

interface Props {
  searchParams: { media?: string; window?: string };
}

const MEDIA_TABS: { key: MediaType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Shows' },
];

const WINDOW_TABS: { key: 'trending' | 'all-time'; label: string }[] = [
  { key: 'trending', label: 'Trending (30d)' },
  { key: 'all-time', label: 'All-time' },
];

export default async function DiscoverPage({ searchParams }: Props) {
  const mediaTab = (['movie', 'tv'].includes(searchParams.media ?? '')
    ? searchParams.media
    : 'all') as MediaType | 'all';
  const windowTab = searchParams.window === 'all-time' ? 'all-time' : 'trending';

  const entries = await getCommunityRankings({
    mediaType: mediaTab === 'all' ? undefined : mediaTab,
    trending: windowTab === 'trending',
    limit: 25,
  });

  const baseHref = '/discover';

  return (
    <div className="animate-fade-in-up">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Discover</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Community consensus, weighted toward trusted reviewers. Titles need at least{' '}
        {CONFIDENCE_THRESHOLD} ratings to appear.
      </p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1 rounded-lg border border-line bg-surface p-1 text-sm">
          {MEDIA_TABS.map((tab) => {
            const href = `${baseHref}?media=${tab.key}&window=${windowTab}`;
            const active = tab.key === mediaTab;
            return (
              <Link
                key={tab.key}
                href={href}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active ? 'bg-accent text-black font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <nav className="flex gap-1 rounded-lg border border-line bg-surface p-1 text-sm">
          {WINDOW_TABS.map((tab) => {
            const href = `${baseHref}?media=${mediaTab}&window=${tab.key}`;
            const active = tab.key === windowTab;
            return (
              <Link
                key={tab.key}
                href={href}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active ? 'bg-accent text-black font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <CommunityList entries={entries} />
    </div>
  );
}
