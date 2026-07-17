import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { getDocsByIds } from '@/lib/firestore-helpers';
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
  const user = await getCurrentUser();
  const db = getAdminDb();

  const listSnap = await db.collection('lists').doc(params.id).get();
  if (!listSnap.exists) notFound();
  const list = { id: listSnap.id, ...listSnap.data() } as ListRecord;

  const ownerSnap = await db.collection('profiles').doc(list.owner_id).get();
  const ownerUsername = ownerSnap.data()?.username as string | undefined;

  const itemsSnap = await db
    .collection('listItems')
    .where('list_id', '==', params.id)
    .orderBy('rank', 'asc')
    .get();
  const rawItems = itemsSnap.docs.map((d) => d.data() as Omit<ListItemWithTitle, 'titles'>);

  const titleMap = await getDocsByIds<Title>(
    db,
    'titles',
    rawItems.map((i) => i.title_id)
  );

  const items: ListItemWithTitle[] = rawItems
    .map((i) => {
      const title = titleMap.get(i.title_id);
      return title ? { ...i, titles: title } : null;
    })
    .filter((i): i is ListItemWithTitle => i !== null);

  const canEdit = !!user && (list.owner_id === user.uid || list.is_collaborative);

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
        {list.description && <p className="mb-2 text-sm text-zinc-400">{list.description}</p>}
        {ownerUsername && (
          <p className="text-xs text-zinc-500">
            by{' '}
            <Link href={`/profile/${ownerUsername}`} className="hover:text-accent">
              {ownerUsername}
            </Link>
          </p>
        )}
      </div>

      <ListEditor listId={params.id} initialItems={items} canEdit={canEdit} />
    </div>
  );
}
