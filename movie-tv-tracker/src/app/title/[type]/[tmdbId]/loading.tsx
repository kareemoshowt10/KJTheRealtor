export default function Loading() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="skeleton h-72 w-48 shrink-0" />
      <div className="flex-1">
        <div className="skeleton mb-2 h-8 w-2/3" />
        <div className="skeleton mb-6 h-3 w-24" />
        <div className="skeleton mb-2 h-4 w-full" />
        <div className="skeleton mb-2 h-4 w-full" />
        <div className="skeleton mb-8 h-4 w-3/4" />
        <div className="skeleton h-24 w-full max-w-md" />
      </div>
    </div>
  );
}
