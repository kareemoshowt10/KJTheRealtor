import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ListEditor from '@/components/ListEditor';
import type { ListRecord, Title } from '@/lib/types';

interface Props {
  params: { id: string };
}

interface ListItemWithTitle {
  list_id: string;
  title_id: string;
  rank: number;
  added_by: string;
  titles: Title;
}

export default async function ListDetailPage({ params }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: list } = await supabase
    .from('lists')
    .select('*, profiles!owner_id(username)')
    .eq('id', params.id)
    .maybeSingle<ListRecord & { profiles: { username: string } }>();

  if (!list) notFound();

  const { data: items } = await supabase
    .from('list_items')
    .select('*, titles(*)')
    .eq('list_id', params.id)
    .order('rank', { ascending: true })
    .returns<ListItemWithTitle[]>();

  const canEdit =
    !!user && (list.owner_id === user.id || list.is_collaborative);

  return (
    <div>
      <div className="mb-6">
        <div className="mb-1 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold">{list.title}</h1>
          {list.is_collaborative && (
            <span className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              collaborative
            </span>
          )}
        </div>
        {list.description && (
          <p className="mb-2 text-sm text-zinc-400">{list.description}</p>
        )}
        <p className="text-xs text-zinc-500">
          by{' '}
          <Link
            href={`/profile/${(list as ListRecord & { profiles: { username: string } }).profiles?.username}`}
            className="hover:text-accent"
          >
            {(list as ListRecord & { profiles: { username: string } }).profiles?.username}
          </Link>
        </p>
      </div>

      <ListEditor listId={params.id} initialItems={items ?? []} canEdit={canEdit} />
    </div>
  );
}
