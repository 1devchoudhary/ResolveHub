import { Link } from 'react-router-dom';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatRelative, formatDateTime } from '../../utilities/format';

// Desktop column template shared by the header and every row
const COLUMNS =
  'md:grid md:grid-cols-[minmax(0,1fr)_9.5rem_6rem_10rem_6.5rem_1rem] md:items-center md:gap-4';

export const TicketTableHeader = ({ personLabel = 'Agent' }) => (
  <div
    className={`hidden ${COLUMNS} border-b border-border-default bg-surface-secondary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary`}
  >
    <span>Ticket</span>
    <span>Status</span>
    <span>Priority</span>
    <span>{personLabel}</span>
    <span>Updated</span>
    <span className="sr-only">Open</span>
  </div>
);

export const AgentCell = ({ agent, emptyLabel = 'Unassigned' }) =>
  agent ? (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar name={agent.name} size="xs" />
      <span className="truncate text-sm text-text-secondary">{agent.name}</span>
    </span>
  ) : (
    <span className="flex items-center gap-2 text-sm text-text-tertiary">
      <span
        className="h-6 w-6 shrink-0 rounded-full border border-dashed border-border-strong"
        aria-hidden="true"
      />
      {emptyLabel}
    </span>
  );

// `basePath` decides which portal the row links into; `person` picks the column to show
// (customers see their agent, staff see the customer)
export const TicketRow = ({ ticket, basePath = '/app/tickets', person = 'assignee' }) => (
  <Link
    to={`${basePath}/${ticket.number}`}
    className={`group flex flex-col gap-2.5 px-5 py-4 ${COLUMNS} md:py-3.5 hover:bg-surface-secondary focus-visible:bg-surface-secondary transition-colors duration-150`}
  >
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <span className="font-mono font-semibold">{ticket.number}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{ticket.category.name}</span>
        {ticket.replyCount > 0 && (
          <span className="inline-flex items-center gap-0.5" title={`${ticket.replyCount} replies`}>
            <MessageSquare className="h-3 w-3" />
            {ticket.replyCount}
          </span>
        )}
        <span className="ml-auto md:hidden">{formatRelative(ticket.updatedAt)}</span>
      </div>
      <p className="mt-0.5 truncate text-sm font-medium text-text-primary transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
        {ticket.subject}
      </p>
    </div>

    {/* Mobile badges */}
    <div className="flex flex-wrap items-center gap-3 md:hidden">
      <StatusBadge status={ticket.status} />
      <PriorityBadge priority={ticket.priority} />
    </div>

    {/* Desktop cells */}
    <div className="hidden md:block">
      <StatusBadge status={ticket.status} />
    </div>
    <div className="hidden md:block">
      <PriorityBadge priority={ticket.priority} />
    </div>
    <div className="hidden min-w-0 md:block">
      <AgentCell agent={person === 'customer' ? ticket.customer : ticket.assignee} />
    </div>
    <time
      className="hidden text-sm text-text-tertiary md:block"
      dateTime={ticket.updatedAt}
      title={formatDateTime(ticket.updatedAt)}
    >
      {formatRelative(ticket.updatedAt)}
    </time>
    <ChevronRight className="hidden h-4 w-4 -translate-x-1 text-text-tertiary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 md:block" />
  </Link>
);
