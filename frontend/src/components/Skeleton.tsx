export function Skeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white" key={index}>
          <div className="aspect-[4/3] animate-pulse bg-stone-200" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/4 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
