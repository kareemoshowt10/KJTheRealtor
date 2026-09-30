'use client';

import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    try {
      const auth = getFirebaseAuth();
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/auth/callback`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem('emailForSignIn', email);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link');
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Log in</h1>
      {status === 'sent' ? (
        <p className="text-zinc-300">
          Check <strong>{email}</strong> for a sign-in link to finish logging in. Open it on
          this device/browser.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <button type="submit" disabled={status === 'sending'} className="btn-primary">
            {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
