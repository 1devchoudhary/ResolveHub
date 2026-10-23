import { Skeleton } from '../ui/Skeleton';

// Loading placeholder for the ticket list — render while your request is in flight
export const TicketListSkeleton = ({ rows = 5 }) => (
  <div className="divide-y divide-border-default" aria-busy="true" aria-label="Loading tickets">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-3/4 max-w-md" />
        </div>
        <Skeleton className="hidden md:block h-5 w-24 rounded-full" />
        <Skeleton className="hidden md:block h-4 w-16" />
        <Skeleton className="hidden md:block h-6 w-6 rounded-full" />
        <Skeleton className="hidden md:block h-4 w-14" />
      </div>
    ))}
  </div>
);
