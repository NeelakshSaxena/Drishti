"use client";

/**
 * Loading skeleton for child card
 * Shows placeholder while child data is loading
 */
export function ChildSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm animate-pulse">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24" />
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded flex-1" />
          <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for event card
 */
export function EventSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-28" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for trip panel
 */
export function TripSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <EventSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for children list
 */
export function ChildrenListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ChildSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Pulse animation wrapper
 * Useful for custom skeleton loaders
 */
export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`}
      {...props}
    />
  );
}
