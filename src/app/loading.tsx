export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="relative flex flex-col items-center gap-6">
        {/* Pulsing orb */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
          <span className="relative h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/30" />
        </div>

        <div className="text-center">
          <p className="font-heading text-lg font-semibold">AI VYOM</p>
          <p className="text-sm text-muted-foreground">Loading experience...</p>
        </div>

        {/* Shimmer bar */}
        <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
      </div>
    </div>
  )
}
