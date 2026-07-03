import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import NavLinks from './NavLinks';

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
    <nav className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="text-lg font-bold tracking-tight text-accent">
          Reels &amp; Reruns
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-3">
          <NavLinks />
          {username ? (
            <Link
              href={`/profile/${username}`}
              className="ml-2 rounded-full border border-line bg-surface px-3 py-1 font-medium hover:border-accent/60 hover:text-accent"
            >
              {username}
            </Link>
          ) : (
            <Link href="/login" className="btn-primary ml-2 px-3 py-1">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
