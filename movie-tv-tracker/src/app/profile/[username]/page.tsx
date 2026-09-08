import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { getRankedLibrary } from '@/lib/library';
import { getFollowCounts, isFollowing } from '@/lib/feed';
import RankedList from '@/components/RankedList';
import FollowButton from '@/components/FollowButton';
import type { Profile } from '@/lib/types';

interface Props {
  params: { username: string };
}

export default async function ProfilePage({ params }: Props) {
  const currentUser = await getCurrentUser();
  const db = getAdminDb();

  const usernameSnap = await db.collection('usernames').doc(params.username).get();
  if (!usernameSnap.exists) notFound();

  const uid = usernameSnap.data()!.uid as string;
  const profileSnap = await db.collection('profiles').doc(uid).get();
  if (!profileSnap.exists) notFound();
  const profile = { id: uid, ...profileSnap.data() } as Profile;

  const [entries, counts, following] = await Promise.all([
    getRankedLibrary(profile.id),
    getFollowCounts(profile.id),
    currentUser && currentUser.uid !== profile.id
      ? isFollowing(currentUser.uid, profile.id)
      : Promise.resolve(false),
  ]);

  const movies = entries.filter((e) => e.title.media_type === 'movie');
  const shows = entries.filter((e) => e.title.media_type === 'tv');
  const isOwnProfile = currentUser?.uid === profile.id;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{profile.username}</h1>
          {profile.bio && <p className="mt-1 text-sm text-zinc-400">{profile.bio}</p>}
          <div className="mt-2 flex gap-4 text-sm text-zinc-500">
            <span>
              <strong className="text-zinc-200">{counts.followers}</strong> followers
            </span>
            <span>
              <strong className="text-zinc-200">{counts.following}</strong> following
            </span>
          </div>
        </div>
        {!isOwnProfile && currentUser && (
          <FollowButton targetUserId={profile.id} initialIsFollowing={following} />
        )}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-medium">Movies</h2>
      <RankedList entries={movies} />

      <h2 className="mb-3 mt-8 text-lg font-medium">TV Shows</h2>
      <RankedList entries={shows} />
    </div>
  );
}
