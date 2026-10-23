import { Flag, TicketPlus, UserCheck } from 'lucide-react';
import { STATUS_META, PRIORITY_META } from '../ui/ticketMeta';
import { cn } from '../../utilities/cn';
import { formatRelative, formatDateTime } from '../../utilities/format';

const Strong = ({ children }) => <span className="font-semibold text-text-primary">{children}</span>;

// Icon + sentence for each activity event type
const describe = (event, actorName) => {
  switch (event.type) {
    case 'created':
      return { icon: TicketPlus, text: <><Strong>{actorName}</Strong> opened this ticket</> };
    case 'assigned':
      return event.actor?.name === 'Auto-assign'
        ? { icon: UserCheck, text: <>Auto-assigned to <Strong>{event.to}</Strong></> }
        : { icon: UserCheck, text: <><Strong>{actorName}</Strong> assigned it to <Strong>{event.to}</Strong></> };
    case 'status_changed': {
      const meta = STATUS_META[event.to] ?? STATUS_META.open;
      return {
        icon: meta.icon,
        text: <><Strong>{actorName}</Strong> changed status to <Strong>{meta.label}</Strong></>,
      };
    }
    case 'priority_changed':
      return {
        icon: Flag,
        text: <><Strong>{actorName}</Strong> set priority to <Strong>{PRIORITY_META[event.to]?.label ?? event.to}</Strong></>,
      };
    default:
      return { icon: TicketPlus, text: <><Strong>{actorName}</Strong> updated the ticket</> };
  }
};

export const ActivityTimeline = ({ events = [], viewerId, className }) => (
  <ol className={cn('relative space-y-5', className)}>
    {/* vertical rail */}
    <span className="absolute left-[13px] top-2 bottom-2 w-px bg-border-default" aria-hidden="true" />

    {events.map((event) => {
      const actorName = event.actor?._id && event.actor._id === viewerId ? 'You' : event.actor?.name;
      const { icon: Icon, text } = describe(event, actorName);

      return (
        <li key={event._id} className="relative flex gap-3">
          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-primary text-text-secondary">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm text-text-secondary leading-snug">{text}</p>
            <time className="text-xs text-text-tertiary" dateTime={event.createdAt} title={formatDateTime(event.createdAt)}>
              {formatRelative(event.createdAt)}
            </time>
          </div>
        </li>
      );
    })}
  </ol>
);
