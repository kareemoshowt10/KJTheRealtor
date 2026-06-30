import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRankedLibrary } from '@/lib/library';
import RankedList from '@/components/RankedList';

interface Props {
  params: { username: string };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const entries = await getRankedLibrary(supabase, profile.id);
  const movies = entries.filter((e) => e.title.media_type === 'movie');
  const shows = entries.filter((e) => e.title.media_type === 'tv');

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">{profile.username}</h1>
      {profile.bio && <p className="mb-6 text-sm text-zinc-400">{profile.bio}</p>}

      <h2 className="mb-3 mt-8 text-lg font-medium">Movies</h2>
      <RankedList entries={movies} />

      <h2 className="mb-3 mt-8 text-lg font-medium">TV Shows</h2>
      <RankedList entries={shows} />
    </div>
  );
}
