import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  SearchX,
  Send,
  UserCheck,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Field';
import { Skeleton } from '../../components/ui/Skeleton';
import { Spinner } from '../../components/ui/Spinner';
import { buttonStyles } from '../../components/ui/styles';
import { STATUS_META, PRIORITY_META } from '../../components/ui/ticketMeta';
import { StatusStepper } from '../../components/tickets/StatusStepper';
import { MessageItem } from '../../components/tickets/MessageItem';
import { ActivityTimeline } from '../../components/tickets/ActivityTimeline';
import { useAuth } from '../../context/authContext';
import {
  useAgents,
  useReplyToTicket,
  useTicket,
  useUpdateTicket,
} from '../../hooks/queries/useTickets';
import { cn } from '../../utilities/cn';
import { formatDateTime, formatDuration, formatRelative } from '../../utilities/format';

const Property = ({ label, children }) => (
  <div className="space-y-1.5 px-5 py-3">
    <dt className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{label}</dt>
    <dd>{children}</dd>
  </div>
);

// Reply to the customer, or leave a note only staff can see; optionally move the status
const Composer = ({ ticket }) => {
  const [mode, setMode] = useState('reply'); // reply | note
  const [body, setBody] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const reply = useReplyToTicket(ticket.number);
  const isNote = mode === 'note';

  const statusOptions = ticket.allowedStatuses.filter((s) => s !== 'open');

  const submit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    reply.mutate(
      { body: body.trim(), isInternal: isNote, ...(nextStatus && { status: nextStatus }) },
      {
        onSuccess: () => {
          setBody('');
          setNextStatus('');
          toast.success(isNote ? 'Internal note added' : 'Reply sent to the customer');
        },
        onError: (err) => toast.error(err.errors.body ?? err.message),
      },
    );
  };

  return (
    <form onSubmit={submit}>
      <div className="mb-3 inline-flex rounded-lg bg-surface-tertiary p-1" role="tablist">
        {[
          { key: 'reply', label: 'Reply to customer', icon: MessageSquare },
          { key: 'note', label: 'Internal note', icon: Lock },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={mode === option.key}
            onClick={() => setMode(option.key)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              mode === option.key
                ? 'bg-surface-primary text-text-primary shadow-soft'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <option.icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-xl border bg-surface-primary shadow-soft transition-all focus-within:ring-4',
          isNote
            ? 'border-dashed border-status-warning/50 focus-within:ring-status-warning/15'
            : 'border-border-default focus-within:border-brand-500 focus-within:ring-brand-500/15',
        )}
      >
        <label htmlFor="staff-reply" className="sr-only">
          {isNote ? 'Internal note' : 'Reply'}
        </label>
        <textarea
          id="staff-reply"
          rows={4}
          value={body}
          maxLength={5000}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e);
          }}
          placeholder={
            isNote
              ? 'Only your team will see this…'
              : `Reply to ${ticket.customer.name.split(' ')[0]}…`
          }
          className={cn(
            'block w-full resize-none border-0 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none',
            isNote ? 'bg-status-warning-bg/40' : 'bg-transparent',
          )}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle bg-surface-secondary px-3 py-2">
          <div className="flex items-center gap-2">
            <label htmlFor="reply-status" className="text-xs text-text-tertiary">
              Then set status
            </label>
            <Select
              id="reply-status"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              // `!` wins over the base input padding (cn joins classes, it does not merge them)
              className="h-8 py-1! text-xs"
            >
              <option value="">Keep automatic</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={reply.isPending || !body.trim()}>
            {reply.isPending ? (
              <Spinner />
            ) : isNote ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isNote ? 'Add note' : 'Send reply'}
          </Button>
        </div>
      </div>
    </form>
  );
};

const PropertiesCard = ({ ticket, user }) => {
  const update = useUpdateTicket(ticket.number);
  const { data: agents = [] } = useAgents();

  const change = (changes, message) =>
    update.mutate(changes, {
      onSuccess: () => toast.success(message),
      onError: (err) => toast.error(Object.values(err.errors)[0] ?? err.message),
    });

  const statusChoices = [ticket.status, ...ticket.allowedStatuses];
  const isMine = ticket.assignee?.id === user.id;

  return (
    <Card>
      <CardHeader title="Properties" />
      <dl className="divide-y divide-border-default">
        <Property label="Status">
          <Select
            aria-label="Status"
            value={ticket.status}
            disabled={update.isPending || statusChoices.length === 1}
            onChange={(e) =>
              change(
                { status: e.target.value },
                `Status set to ${STATUS_META[e.target.value].label}`,
              )
            }
          >
            {statusChoices.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </Select>
        </Property>
        <Property label="Priority">
          <Select
            aria-label="Priority"
            value={ticket.priority}
            disabled={update.isPending || ticket.status === 'closed'}
            onChange={(e) =>
              change(
                { priority: e.target.value },
                `Priority set to ${PRIORITY_META[e.target.value].label}`,
              )
            }
          >
            {Object.entries(PRIORITY_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </Property>
        <Property label="Assignee">
          <Select
            aria-label="Assignee"
            value={ticket.assignee?.id ?? ''}
            disabled={update.isPending || ticket.status === 'closed'}
            onChange={(e) => {
              const assigneeId = e.target.value ? Number(e.target.value) : null;
              const name = agents.find((a) => a.id === assigneeId)?.name;
              change({ assigneeId }, assigneeId ? `Assigned to ${name}` : 'Ticket unassigned');
            }}
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} · {agent.openTickets} open
              </option>
            ))}
          </Select>
          {user.role === 'agent' && !isMine && ticket.status !== 'closed' && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="mt-2"
              disabled={update.isPending}
              onClick={() => change({ assigneeId: user.id }, 'Assigned to you')}
            >
              <UserCheck className="h-3.5 w-3.5" /> Assign to me
            </Button>
          )}
        </Property>
        <Property label="Category">
          <span className="text-sm font-medium text-text-primary">{ticket.category.name}</span>
        </Property>
      </dl>
    </Card>
  );
};

const responseTime = (ticket) =>
  ticket.firstResponseAt
    ? formatDuration((new Date(ticket.firstResponseAt) - new Date(ticket.createdAt)) / 60_000)
    : 'Not yet';

// Shared by the agent and admin portals
export const TicketWorkspace = ({ portal = 'agent' }) => {
  const { ticketNumber } = useParams();
  const { user } = useAuth();
  const { data: ticket, isPending, error } = useTicket(ticketNumber);
  const backPath = portal === 'agent' ? '/agent' : '/admin/tickets';

  if (isPending) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-8 w-2/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <EmptyState
          icon={SearchX}
          title={error.status === 404 ? 'Ticket not found' : "Couldn't load this ticket"}
          description={error.status === 404 ? `There is no ticket ${ticketNumber}.` : error.message}
          action={
            <Link to={backPath} className={buttonStyles({ variant: 'secondary' })}>
              <ArrowLeft className="h-4 w-4" /> Back to the queue
            </Link>
          }
        />
      </Card>
    );
  }

  const internalCount = ticket.messages.filter((m) => m.isInternal).length;

  return (
    <>
      <Link
        to={backPath}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to the queue
      </Link>

      <div className="mb-6 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
          <span className="rounded-md border border-border-default bg-surface-primary px-2 py-0.5 font-mono font-semibold text-text-secondary">
            {ticket.number}
          </span>
          <span>
            Opened {formatRelative(ticket.createdAt)} by {ticket.customer.name}
          </span>
        </div>
        <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight text-text-primary">
          {ticket.subject}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <Badge tone="neutral">{ticket.category.name}</Badge>
        </div>
      </div>

      <Card className="mb-6 px-4 py-5 sm:px-8">
        <StatusStepper ticket={ticket} audience="staff" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Conversation"
              description={`${ticket.messages.length - internalCount + 1} public · ${internalCount} internal`}
            />
            <div className="space-y-6 p-5 sm:p-6">
              <MessageItem
                author={{ ...ticket.customer, role: 'customer' }}
                label="Original request"
                body={ticket.description}
                createdAt={ticket.createdAt}
              />
              {ticket.messages.map((message) => (
                <MessageItem
                  key={message.id}
                  author={message.author}
                  isOwn={message.author.id === user.id}
                  isInternal={message.isInternal}
                  body={message.body}
                  createdAt={message.createdAt}
                />
              ))}
            </div>
            <div className="border-t border-border-default p-5 sm:p-6">
              {ticket.status === 'closed' ? (
                <p className="rounded-lg bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
                  This ticket is closed.{' '}
                  {user.role === 'admin'
                    ? 'Reopen it from the status menu to reply.'
                    : 'Ask an admin to reopen it if more work is needed.'}
                </p>
              ) : (
                <Composer ticket={ticket} />
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PropertiesCard ticket={ticket} user={user} />

          <Card>
            <CardHeader title="Customer" />
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <Avatar name={ticket.customer.name} size="md" />
                <p className="text-sm font-semibold text-text-primary">{ticket.customer.name}</p>
              </div>
              <a
                href={`mailto:${ticket.customer.email}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-600"
              >
                <Mail className="h-4 w-4" /> {ticket.customer.email}
              </a>
              <a
                href={`tel:${ticket.customer.mobile}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-600"
              >
                <Phone className="h-4 w-4" /> {ticket.customer.mobile}
              </a>
            </div>
          </Card>

          <Card>
            <CardHeader title="Timing" />
            <dl className="divide-y divide-border-default text-sm">
              <div className="flex justify-between px-5 py-3">
                <dt className="text-text-tertiary">First response</dt>
                <dd className="font-medium text-text-primary">{responseTime(ticket)}</dd>
              </div>
              <div className="flex justify-between px-5 py-3">
                <dt className="text-text-tertiary">Created</dt>
                <dd
                  className="font-medium text-text-primary"
                  title={formatDateTime(ticket.createdAt)}
                >
                  {formatRelative(ticket.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between px-5 py-3">
                <dt className="text-text-tertiary">Last update</dt>
                <dd
                  className="font-medium text-text-primary"
                  title={formatDateTime(ticket.updatedAt)}
                >
                  {formatRelative(ticket.updatedAt)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <div className="p-5">
              <ActivityTimeline events={[...ticket.events].reverse()} viewerId={user.id} />
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
};
