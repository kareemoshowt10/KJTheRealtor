import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; titleId: string } }
) {
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

  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', params.id)
    .eq('title_id', params.titleId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
