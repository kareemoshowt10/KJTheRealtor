import ListSkeleton from '@/components/ListSkeleton';

export default function Loading() {
  return (
    <div>
      <div className="skeleton mb-2 h-8 w-40" />
      <div className="skeleton mb-8 h-4 w-56" />
      <ListSkeleton rows={5} header={false} />
    </div>
  );
}
