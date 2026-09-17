export default function ListSkeleton({ rows = 6, header = true }: { rows?: number; header?: boolean }) {
  return (
    <div>
      {header && <div className="skeleton mb-6 h-8 w-48" />}
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card flex items-center gap-4 p-3">
            <div className="skeleton h-[60px] w-10" />
            <div className="flex-1">
              <div className="skeleton mb-2 h-4 w-1/3" />
              <div className="skeleton h-3 w-1/5" />
            </div>
            <div className="skeleton h-8 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
