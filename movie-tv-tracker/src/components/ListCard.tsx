import Link from 'next/link';
import type { ListRecord } from '@/lib/types';

interface Props {
  list: ListRecord;
  itemCount?: number;
  ownerUsername?: string;
}

export default function ListCard({ list, itemCount, ownerUsername }: Props) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="block rounded bg-surface p-4 hover:ring-1 hover:ring-accent"
    >
      <h2 className="font-semibold">{list.title}</h2>
      {list.description && (
        <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{list.description}</p>
      )}
      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
        {ownerUsername && <span>by {ownerUsername}</span>}
        {list.is_collaborative && (
          <span className="rounded bg-zinc-800 px-1.5 py-0.5">collaborative</span>
        )}
        {itemCount !== undefined && <span>{itemCount} titles</span>}
      </div>
    </Link>
  );
}
