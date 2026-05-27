interface SkeletonProps {
  className?: string
}

function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-surface-3 rounded ${className}`} />
}

export function PostCardSkeleton() {
  return (
    <div className="bg-surface-1 border border-border-default rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

export function PersonCardSkeleton() {
  return (
    <div className="bg-surface-1 border border-border-default rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-4/5" />
    </div>
  )
}

export function KpiSkeleton() {
  return (
    <div className="bg-surface-1 border border-border-default rounded-lg px-4 py-3 space-y-2">
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
