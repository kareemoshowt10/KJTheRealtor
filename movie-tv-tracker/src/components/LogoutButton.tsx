'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    await signOut(getFirebaseAuth()).catch(() => {});
    router.push('/');
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400">
      Log out
    </button>
  );
}
