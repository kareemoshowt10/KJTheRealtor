import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <nav className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-accent">
        Reels &amp; Reruns
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/search" className="hover:text-accent">
          Search
        </Link>
        <Link href="/feed" className="hover:text-accent">
          Feed
        </Link>
        <Link href="/rankings" className="hover:text-accent">
          Rankings
        </Link>
        <Link href="/lists" className="hover:text-accent">
          Lists
        </Link>
        {username ? (
          <Link href={`/profile/${username}`} className="hover:text-accent">
            {username}
          </Link>
        ) : (
          <Link href="/login" className="hover:text-accent">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
