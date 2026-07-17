import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/session';
import { getRankedLibrary } from '@/lib/library';
import RankedList from '@/components/RankedList';

export default async function RankingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const entries = await getRankedLibrary(user.uid);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">My Rankings</h1>
      <RankedList entries={entries} />
    </div>
  );
}
