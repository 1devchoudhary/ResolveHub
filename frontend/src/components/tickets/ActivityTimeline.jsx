import { Link } from 'react-router-dom';
import { Flag, TicketPlus, UserCheck, UserMinus } from 'lucide-react';
import { STATUS_META, PRIORITY_META } from '../ui/ticketMeta';
import { cn } from '../../utilities/cn';
import { formatRelative, formatDateTime } from '../../utilities/format';

const Strong = ({ children }) => (
  <span className="font-semibold text-text-primary">{children}</span>
);

// Icon + sentence for each audit event. actor === null means the system did it.
const describe = (event, actorName) => {
  switch (event.type) {
    case 'created':
      return {
        icon: TicketPlus,
        text: (
          <>
            <Strong>{actorName}</Strong> opened the ticket
          </>
        ),
      };
    case 'assigned':
      return {
        icon: UserCheck,
        text: event.actor ? (
          <>
            <Strong>{actorName}</Strong> assigned it to <Strong>{event.to}</Strong>
          </>
        ) : (
          <>
            Auto-assigned to <Strong>{event.to}</Strong>
          </>
        ),
      };
    case 'unassigned':
      return {
        icon: UserMinus,
        text: (
          <>
            <Strong>{actorName}</Strong> unassigned <Strong>{event.from}</Strong>
          </>
        ),
      };
    case 'status_changed': {
      const meta = STATUS_META[event.to] ?? STATUS_META.open;
      return {
        icon: meta.icon,
        text: (
          <>
            <Strong>{actorName}</Strong> changed status to <Strong>{meta.label}</Strong>
          </>
        ),
      };
    }
    case 'priority_changed':
      return {
        icon: Flag,
        text: (
          <>
            <Strong>{actorName}</Strong> set priority to{' '}
            <Strong>{PRIORITY_META[event.to]?.label ?? event.to}</Strong>
          </>
        ),
      };
    default:
      return {
        icon: TicketPlus,
        text: (
          <>
            <Strong>{actorName}</Strong> updated the ticket
          </>
        ),
      };
  }
};

// `ticketBasePath` (dashboard feed only) adds a link to the ticket each event belongs to
export const ActivityTimeline = ({ events = [], viewerId, ticketBasePath, className }) => (
  <ol className={cn('relative space-y-5', className)}>
    <span
      className="absolute bottom-2 left-[13px] top-2 w-px bg-border-default"
      aria-hidden="true"
    />

    {events.map((event) => {
      const actorName = event.actor?.id === viewerId ? 'You' : (event.actor?.name ?? 'System');
      const { icon: Icon, text } = describe(event, actorName);

      return (
        <li key={event.id} className="relative flex gap-3">
          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-primary text-text-secondary">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm leading-snug text-text-secondary">{text}</p>
            <p className="text-xs text-text-tertiary">
              {ticketBasePath && event.ticketNumber && (
                <>
                  <Link
                    to={`${ticketBasePath}/${event.ticketNumber}`}
                    className="font-mono font-semibold hover:text-brand-600"
                  >
                    {event.ticketNumber}
                  </Link>{' '}
                  ·{' '}
                </>
              )}
              <time dateTime={event.createdAt} title={formatDateTime(event.createdAt)}>
                {formatRelative(event.createdAt)}
              </time>
            </p>
          </div>
        </li>
      );
    })}
  </ol>
);
