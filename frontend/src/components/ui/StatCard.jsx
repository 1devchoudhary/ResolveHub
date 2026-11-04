import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { cn } from '../../utilities/cn';

// Dashboard number tile. `value` undefined = still loading.
export const StatCard = ({ icon: Icon, label, value, hint, tone }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', tone)}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
    </div>
    {value === undefined ? (
      <Skeleton className="mt-3 h-9 w-16" />
    ) : (
      <p className="mt-3 text-3xl font-bold tracking-tight text-text-primary">{value}</p>
    )}
    <p className="mt-1 text-xs text-text-tertiary">{hint}</p>
  </Card>
);
