import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { title, description, is_collaborative } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: 'List title required' }, { status: 400 });
  }

  const { data: list, error } = await supabase
    .from('lists')
    .insert({
      owner_id: user.id,
      title: title.trim(),
      description: description?.trim() ?? null,
      is_collaborative: is_collaborative ?? false,
    })
    .select()
    .single();

  if (error || !list) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create list' }, { status: 500 });
  }

  return NextResponse.json({ list });
}
