import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ReorderItem {
  title_id: string;
  rank: number;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: list } = await supabase
    .from('lists')
    .select('owner_id, is_collaborative')
    .eq('id', params.id)
    .maybeSingle();

  if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });

  const canEdit = list.owner_id === user.id || list.is_collaborative;
  if (!canEdit) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { items }: { items: ReorderItem[] } = await request.json();

  const updates = await Promise.all(
    items.map(({ title_id, rank }) =>
      supabase
        .from('list_items')
        .update({ rank })
        .eq('list_id', params.id)
        .eq('title_id', title_id)
    )
  );

  const failed = updates.filter((r) => r.error);
  if (failed.length > 0) {
    return NextResponse.json({ error: 'Some ranks failed to update' }, { status: 500 });
  }

  return NextResponse.json({ reordered: true });
}
