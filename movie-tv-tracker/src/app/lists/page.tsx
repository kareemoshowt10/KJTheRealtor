import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ListCard from '@/components/ListCard';
import type { ListRecord } from '@/lib/types';

export default async function ListsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  // Own lists + collaborative lists
  const { data: ownLists } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .returns<ListRecord[]>();

  const { data: collabLists } = await supabase
    .from('lists')
    .select('*, profiles!owner_id(username)')
    .neq('owner_id', user.id)
    .eq('is_collaborative', true)
    .order('created_at', { ascending: false })
    .returns<(ListRecord & { profiles: { username: string } })[]>();

  // Get item counts per list
  const allListIds = [
    ...(ownLists ?? []).map((l) => l.id),
    ...(collabLists ?? []).map((l) => l.id),
  ];
  const { data: countRows } = await supabase
    .from('list_items')
    .select('list_id')
    .in('list_id', allListIds);

  const countByList = new Map<string, number>();
  for (const row of countRows ?? []) {
    countByList.set(row.list_id, (countByList.get(row.list_id) ?? 0) + 1);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lists</h1>
        <Link
          href="/lists/new"
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-black"
        >
          + New list
        </Link>
      </div>

      <h2 className="mb-3 text-sm font-medium uppercase text-zinc-500">
        {profile?.username}&apos;s lists
      </h2>
      {(ownLists ?? []).length === 0 ? (
        <p className="mb-6 text-sm text-zinc-400">No lists yet.</p>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {(ownLists ?? []).map((list) => (
            <ListCard key={list.id} list={list} itemCount={countByList.get(list.id)} />
          ))}
        </div>
      )}

      {(collabLists ?? []).length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-medium uppercase text-zinc-500">
            Collaborative lists from others
          </h2>
          <div className="flex flex-col gap-3">
            {(collabLists ?? []).map((list) => (
              <ListCard
                key={list.id}
                list={list}
                itemCount={countByList.get(list.id)}
                ownerUsername={list.profiles?.username}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
