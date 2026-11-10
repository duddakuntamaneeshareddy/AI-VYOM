import { cn } from "@/lib/utils"

interface SkeletonCardProps extends React.ComponentProps<"div"> {
  shimmer?: boolean
}

export function SkeletonCard({
  className,
  shimmer = true,
  children,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted",
        className
      )}
      {...props}
    >
      {children}
      {shimmer && (
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
          }}
        />
      )}
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm">
      <SkeletonCard className="aspect-square w-full rounded-xl" />
      <div className="flex flex-col gap-3 px-1 pb-1">
        <SkeletonCard className="h-4 w-20 rounded-full" shimmer={false}>
          <div className="h-full w-full bg-muted" />
        </SkeletonCard>
        <SkeletonCard className="h-5 w-3/4 rounded-md" shimmer={false}>
          <div className="h-full w-full bg-muted" />
        </SkeletonCard>
        <SkeletonCard className="h-4 w-full rounded-md" shimmer={false}>
          <div className="h-full w-full bg-muted" />
        </SkeletonCard>
        <div className="mt-1 flex items-center justify-between">
          <SkeletonCard className="h-6 w-16 rounded-md" shimmer={false}>
            <div className="h-full w-full bg-muted" />
          </SkeletonCard>
          <SkeletonCard className="h-8 w-20 rounded-full" shimmer={false}>
            <div className="h-full w-full bg-muted" />
          </SkeletonCard>
        </div>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <SkeletonCard className="h-32 w-full rounded-2xl p-5" shimmer={false}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <SkeletonCard className="h-4 w-28 rounded-full" shimmer={false}>
            <div className="h-full w-full bg-muted/70" />
          </SkeletonCard>
          <SkeletonCard className="size-10 rounded-xl" shimmer={false}>
            <div className="h-full w-full bg-muted/70" />
          </SkeletonCard>
        </div>
        <SkeletonCard className="h-8 w-24 rounded-md" shimmer={false}>
          <div className="h-full w-full bg-muted/70" />
        </SkeletonCard>
      </div>
    </SkeletonCard>
  )
}
