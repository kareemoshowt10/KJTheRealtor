import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/firebase/session';

const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

async function ensureProfile(uid: string, email: string | undefined) {
  const db = getAdminDb();
  const profileRef = db.collection('profiles').doc(uid);
  const existing = await profileRef.get();
  if (existing.exists) return;

  const base =
    (email ?? `user-${uid.slice(0, 8)}`)
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase() || `user${uid.slice(0, 8)}`;

  let username = base;
  let suffix = 0;

  // Reserve the username via a transaction so concurrent signups can't collide.
  for (let attempt = 0; attempt < 20; attempt++) {
    const usernameRef = db.collection('usernames').doc(username);
    try {
      await db.runTransaction(async (tx) => {
        const usernameDoc = await tx.get(usernameRef);
        if (usernameDoc.exists) throw new Error('taken');
        tx.set(usernameRef, { uid });
        tx.set(profileRef, {
          username,
          avatar_url: null,
          bio: null,
          created_at: new Date().toISOString(),
        });
      });
      return;
    } catch {
      suffix += 1;
      username = `${base}${suffix}`;
    }
  }
  throw new Error('Failed to allocate a username');
}

export async function POST(request: Request) {
  const { idToken }: { idToken?: string } = await request.json();
  if (!idToken) {
    return NextResponse.json({ error: 'idToken required' }, { status: 400 });
  }

  const adminAuth = getAdminAuth();

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
  }

  await ensureProfile(decoded.uid, decoded.email);

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
    path: '/',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
