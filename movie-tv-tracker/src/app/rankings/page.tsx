import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRankedLibrary } from '@/lib/library';
import RankedList from '@/components/RankedList';

export default async function RankingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const entries = await getRankedLibrary(supabase, user.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">My Rankings</h1>
      <RankedList entries={entries} />
    </div>
  );
}
