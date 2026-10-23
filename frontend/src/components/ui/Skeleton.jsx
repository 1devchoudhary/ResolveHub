import { cn } from '../../utilities/cn';

// Grey placeholder block for loading states: <Skeleton className="h-4 w-32" />
export const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-surface-tertiary', className)} aria-hidden="true" />
);
