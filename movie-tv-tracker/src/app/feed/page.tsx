import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { getFollowingActivity } from '@/lib/feed';
import ActivityFeed from '@/components/ActivityFeed';

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  const events = await getFollowingActivity(user.uid);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Friends&apos; Activity</h1>
        <Link href="/search" className="text-sm text-accent hover:underline">
          Find something to watch →
        </Link>
      </div>
      <ActivityFeed events={events} />
    </div>
  );
}
