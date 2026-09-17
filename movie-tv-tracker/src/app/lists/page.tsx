import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAdminDb } from '@/lib/firebase/admin';
import { getDocsByIds, queryWhereIn } from '@/lib/firestore-helpers';
import ListCard from '@/components/ListCard';
import type { ListRecord, Profile } from '@/lib/types';

export default async function ListsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const db = getAdminDb();

  const profileSnap = await db.collection('profiles').doc(user.uid).get();
  const username = profileSnap.data()?.username as string | undefined;

  const [ownSnap, collabSnap] = await Promise.all([
    db.collection('lists').where('owner_id', '==', user.uid).orderBy('created_at', 'desc').get(),
    db.collection('lists').where('is_collaborative', '==', true).orderBy('created_at', 'desc').get(),
  ]);

  const ownLists = ownSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ListRecord);
  const collabLists = collabSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as ListRecord)
    .filter((l) => l.owner_id !== user.uid);

  const allListIds = [...ownLists.map((l) => l.id), ...collabLists.map((l) => l.id)];
  const [itemRows, ownerProfiles] = await Promise.all([
    queryWhereIn<{ list_id: string }>(db, 'listItems', 'list_id', allListIds),
    getDocsByIds<Profile>(
      db,
      'profiles',
      collabLists.map((l) => l.owner_id)
    ),
  ]);

  const countByList = new Map<string, number>();
  for (const row of itemRows) {
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

      <h2 className="mb-3 text-sm font-medium uppercase text-zinc-500">{username}&apos;s lists</h2>
      {ownLists.length === 0 ? (
        <p className="mb-6 text-sm text-zinc-400">No lists yet.</p>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {ownLists.map((list) => (
            <ListCard key={list.id} list={list} itemCount={countByList.get(list.id)} />
          ))}
        </div>
      )}

      {collabLists.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-medium uppercase text-zinc-500">
            Collaborative lists from others
          </h2>
          <div className="flex flex-col gap-3">
            {collabLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                itemCount={countByList.get(list.id)}
                ownerUsername={ownerProfiles.get(list.owner_id)?.username}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
