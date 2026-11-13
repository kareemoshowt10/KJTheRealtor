import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import NavLinks from './NavLinks';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const user = await getCurrentUser();

  let username: string | null = null;
  if (user) {
    const profileSnap = await getAdminDb().collection('profiles').doc(user.uid).get();
    username = (profileSnap.data()?.username as string | undefined) ?? null;
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-accent"
        >
          Reels &amp; Reruns
        </Link>

        {/* The link set outgrows narrow screens, so it scrolls on its own rather
            than pushing the whole page wider than the viewport. */}
        <div className="no-scrollbar min-w-0 flex-1 overflow-x-auto">
          <div className="flex items-center gap-1 whitespace-nowrap text-sm sm:gap-3">
            <NavLinks />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {username ? (
            <>
              <Link
                href={`/profile/${username}`}
                className="max-w-[8rem] truncate rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium hover:border-accent/60 hover:text-accent"
              >
                {username}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="btn-primary whitespace-nowrap px-3 py-1">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
