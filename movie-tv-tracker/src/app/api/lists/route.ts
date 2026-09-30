import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { title, description, is_collaborative } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: 'List title required' }, { status: 400 });
  }

  const data = {
    owner_id: user.uid,
    title: title.trim(),
    description: description?.trim() ?? null,
    is_collaborative: is_collaborative ?? false,
    created_at: new Date().toISOString(),
  };

  const ref = await getAdminDb().collection('lists').add(data);

  return NextResponse.json({ list: { id: ref.id, ...data } });
}
