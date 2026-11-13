import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/session';
import { getPlannerEntries } from '@/lib/planner';
import PlannerCalendar from '@/components/PlannerCalendar';

export default async function PlannerPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const entries = await getPlannerEntries(user.uid);

  return (
    <div className="animate-fade-in-up">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Watch Planner</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Drag titles from your watchlist onto a date to plan what you'll watch and when.
      </p>
      <PlannerCalendar initialEntries={entries} />
    </div>
  );
}
