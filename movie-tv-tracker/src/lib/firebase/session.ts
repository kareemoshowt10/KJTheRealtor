import { cookies } from 'next/headers';
import { getAdminAuth } from './admin';

export const SESSION_COOKIE_NAME = 'session';

export interface SessionUser {
  uid: string;
  email: string | null;
}

/** Verifies the session cookie server-side. Returns null if absent/invalid/expired. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}
