import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utilities/cn';

export const Spinner = ({ className }) => (
  <LoaderCircle className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />
);

export const FullPageSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-surface-secondary" role="status">
    <Spinner className="h-6 w-6 text-brand-600" />
    <span className="sr-only">Loading…</span>
  </div>
);
