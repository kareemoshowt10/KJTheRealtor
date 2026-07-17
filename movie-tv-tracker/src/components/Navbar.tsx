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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="text-lg font-bold tracking-tight text-accent">
          Reels &amp; Reruns
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-3">
          <NavLinks />
          {username ? (
            <>
              <Link
                href={`/profile/${username}`}
                className="ml-2 rounded-full border border-line bg-surface px-3 py-1 font-medium hover:border-accent/60 hover:text-accent"
              >
                {username}
              </Link>
              <LogoutButton />
            </>
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
