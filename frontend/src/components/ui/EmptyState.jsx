import { cn } from '../../utilities/cn';

export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
    {Icon && (
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl" aria-hidden="true" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border-default bg-surface-primary text-brand-600 shadow-medium dark:text-brand-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    )}
    <h3 className="text-base font-semibold text-text-primary">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
