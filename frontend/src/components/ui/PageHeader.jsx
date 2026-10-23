import { cn } from '../../utilities/cn';

// Title row at the top of every app page
export const PageHeader = ({ title, description, actions, children, className }) => (
  <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="min-w-0">
      {children}
      <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[1.75rem]">{title}</h1>
      {description && <p className="mt-1.5 text-sm text-text-secondary">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
