export default function Loading() {
  return (
    <div>
      <div className="skeleton mb-2 h-8 w-52" />
      <div className="skeleton mb-6 h-4 w-80" />
      <div className="skeleton mb-6 h-16 w-40" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-16" />
        ))}
      </div>
      <div className="skeleton mb-4 h-64 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-56" />
        <div className="skeleton h-56" />
      </div>
    </div>
  );
}
