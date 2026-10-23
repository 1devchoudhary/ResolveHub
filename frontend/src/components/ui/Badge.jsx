import { cn } from '../../utilities/cn';
import { TONE_STYLES } from './styles';
import { STATUS_META, PRIORITY_META } from './ticketMeta';

export const Badge = ({ tone = 'neutral', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
      TONE_STYLES[tone],
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export const StatusBadge = ({ status, className }) => {
  const meta = STATUS_META[status] ?? STATUS_META.open;
  return (
    <Badge tone={meta.tone} className={className}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

export const PriorityBadge = ({ priority, className, showLabel = true }) => {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META.medium;
  const Icon = meta.icon;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary whitespace-nowrap', className)}
      title={`${meta.label} priority`}
    >
      <Icon className={cn('h-4 w-4', meta.color)} strokeWidth={2.25} aria-hidden="true" />
      {showLabel ? meta.label : <span className="sr-only">{meta.label} priority</span>}
    </span>
  );
};
