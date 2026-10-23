import { cn } from '../../utilities/cn';

export const Card = ({ className, children, ...props }) => (
  <div
    className={cn('rounded-xl border border-border-default bg-surface-primary shadow-soft', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, description, action, icon: Icon, className }) => (
  <div className={cn('flex items-start justify-between gap-4 border-b border-border-default px-5 py-4', className)}>
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:text-brand-300">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
