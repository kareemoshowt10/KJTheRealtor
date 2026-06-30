import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getRankedLibrary } from '@/lib/library';
import RankedList from '@/components/RankedList';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div>
        <h1 className="mb-4 text-3xl font-semibold">Reels &amp; Reruns</h1>
        <p className="mb-6 max-w-md text-zinc-400">
          Track what you watch, rank what actually lasts, and discuss it with people whose
          taste you trust.
        </p>
        <Link href="/login" className="rounded bg-accent px-4 py-2 font-medium text-black">
          Get started
        </Link>
      </div>
    );
  }

  const entries = await getRankedLibrary(supabase, user.id);
  const watching = entries.filter((e) => e.userTitle.status === 'watching');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Currently watching</h1>
      <RankedList entries={watching} />

      <div className="mt-8 flex gap-3">
        <Link href="/search" className="rounded bg-accent px-4 py-2 text-sm font-medium text-black">
          Find something to watch
        </Link>
        <Link
          href="/rankings"
          className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-accent"
        >
          View full rankings
        </Link>
      </div>
    </div>
  );
}
