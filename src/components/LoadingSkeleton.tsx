export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Loading content">
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-surface-elevated" />
          <div className="flex-1">
            <div className="h-4 bg-surface-elevated rounded w-40 mb-2" />
            <div className="h-3 bg-surface-elevated rounded w-56" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-surface-elevated rounded-lg" />
          <div className="h-24 bg-surface-elevated rounded-lg" />
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="h-4 bg-surface-elevated rounded w-32 mb-4" />
        <div className="space-y-2">
          <div className="h-12 bg-surface-elevated rounded-lg" />
          <div className="h-12 bg-surface-elevated rounded-lg" />
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
