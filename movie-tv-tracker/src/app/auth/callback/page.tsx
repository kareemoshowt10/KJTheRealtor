'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function complete() {
      const auth = getFirebaseAuth();
      const href = window.location.href;

      if (!isSignInWithEmailLink(auth, href)) {
        setError('This sign-in link is invalid or has expired.');
        return;
      }

      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Confirm your email to finish signing in');
      }
      if (!email) {
        setError('Email is required to complete sign-in.');
        return;
      }

      try {
        const credential = await signInWithEmailLink(auth, email, href);
        window.localStorage.removeItem('emailForSignIn');

        const idToken = await credential.user.getIdToken();
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        if (!res.ok) throw new Error('Failed to establish session');

        router.replace('/');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign-in failed');
      }
    }

    complete();
  }, [router]);

  return (
    <div className="mx-auto max-w-sm text-center">
      {error ? (
        <>
          <p className="mb-4 text-sm text-red-400">{error}</p>
          <a href="/login" className="text-accent underline">
            Try again
          </a>
        </>
      ) : (
        <p className="text-sm text-zinc-400">Signing you in…</p>
      )}
    </div>
  );
}
