interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  // REDESIGN: Surf Crest pulse — softer than stone-200
  return (
    <div className={`animate-pulse bg-[#d2e5d3] rounded-xl ${className}`} />
  );
}

export function SkeletonCard() {
  // REDESIGN: Surf Crest border on skeleton card
  return (
    <div className="bg-white rounded-2xl border border-[#d2e5d3] shadow-sm p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}
