export default function Loading() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="skeleton mb-4 h-8 w-48" />
        <div className="skeleton h-96 w-full" />
      </div>
      <div className="skeleton h-96 w-full shrink-0 lg:w-64" />
    </div>
  );
}
