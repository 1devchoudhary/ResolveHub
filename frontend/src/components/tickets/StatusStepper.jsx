import { Check, Hourglass } from 'lucide-react';
import { cn } from '../../utilities/cn';
import { formatRelative } from '../../utilities/format';

const STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
];

// Which step the ticket is on (purely for display)
const currentStepIndex = ({ status, assignedTo }) => {
  if (status === 'resolved' || status === 'closed') return 4; // everything complete
  if (status === 'in-progress' || status === 'pending') return 2;
  return assignedTo ? 1 : 0;
};

// When each step happened, read from the activity log
const stepDates = (ticket) => {
  const activity = ticket.activity ?? [];
  const firstStatus = (statuses) =>
    activity.find((e) => e.type === 'status_changed' && statuses.includes(e.to))?.createdAt;
  return {
    submitted: ticket.createdAt,
    assigned: activity.find((e) => e.type === 'assigned')?.createdAt,
    'in-progress': firstStatus(['in-progress', 'pending']),
    resolved: firstStatus(['resolved']),
  };
};

export const StatusStepper = ({ ticket }) => {
  const current = currentStepIndex(ticket);
  const dates = stepDates(ticket);
  const awaitingCustomer = ticket.status === 'pending';

  return (
    <ol className="flex w-full items-start" aria-label="Ticket progress">
      {STEPS.map((step, i) => {
        const isComplete = i < current;
        const isCurrent = i === current;
        const isWaiting = isCurrent && awaitingCustomer;
        const label = isWaiting ? 'Awaiting your reply' : step.label;

        return (
          <li key={step.key} className="relative flex flex-1 flex-col items-center text-center">
            {/* connector to the next step */}
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  'absolute left-1/2 top-4 h-0.5 w-full',
                  i < current ? 'bg-brand-600' : 'bg-border-default',
                )}
                aria-hidden="true"
              />
            )}

            <span
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                isComplete && 'border-brand-600 bg-brand-600 text-white',
                isCurrent &&
                  !isWaiting &&
                  'border-brand-600 bg-surface-primary text-brand-600 ring-4 ring-brand-100 dark:text-brand-300',
                isWaiting &&
                  'border-status-warning bg-surface-primary text-status-warning ring-4 ring-status-warning-bg',
                !isComplete &&
                  !isCurrent &&
                  'border-border-strong bg-surface-primary text-text-tertiary',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isComplete ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : isWaiting ? (
                <Hourglass className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </span>

            <span
              className={cn(
                'mt-2 px-1 text-xs font-medium leading-tight',
                isWaiting
                  ? 'text-status-warning-fg'
                  : isComplete || isCurrent
                    ? 'text-text-primary'
                    : 'text-text-tertiary',
              )}
            >
              {label}
            </span>
            {dates[step.key] && (isComplete || isCurrent) && (
              <span className="mt-0.5 hidden text-[11px] text-text-tertiary sm:block">
                {formatRelative(dates[step.key])}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};
