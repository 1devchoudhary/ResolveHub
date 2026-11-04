import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Archive,
  Copy,
  Hourglass,
  RotateCcw,
  SearchX,
  Send,
  CircleCheckBig,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Spinner } from '../../components/ui/Spinner';
import { buttonStyles } from '../../components/ui/styles';
import { StatusStepper } from '../../components/tickets/StatusStepper';
import { MessageItem } from '../../components/tickets/MessageItem';
import { ActivityTimeline } from '../../components/tickets/ActivityTimeline';
import { AgentCell } from '../../components/tickets/TicketRow';
import { useAuth } from '../../context/authContext';
import { useReplyToTicket, useTicket, useUpdateTicket } from '../../hooks/queries/useTickets';
import { formatDateTime, formatRelative } from '../../utilities/format';

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-3">
    <dt className="text-sm text-text-tertiary">{label}</dt>
    <dd className="min-w-0 text-right text-sm font-medium text-text-primary">{children}</dd>
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-6" aria-busy="true">
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-24 w-full" />
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-80 lg:col-span-2" />
      <Skeleton className="h-80" />
    </div>
  </div>
);

const NotFound = ({ number }) => (
  <Card>
    <EmptyState
      icon={SearchX}
      title="Ticket not found"
      description={`We couldn’t find a ticket with ID “${number}”. It may belong to another account, or the link is wrong.`}
      action={
        <Link to="/app/tickets" className={buttonStyles({ variant: 'secondary' })}>
          <ArrowLeft className="h-4 w-4" /> Back to tickets
        </Link>
      }
    />
  </Card>
);

const ReplyBox = ({ ticket, user }) => {
  const [body, setBody] = useState('');
  const reply = useReplyToTicket(ticket.number);
  const isAwaitingCustomer = ticket.status === 'pending';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    reply.mutate(
      { body: body.trim() },
      {
        onSuccess: () => {
          setBody('');
          toast.success('Reply sent');
        },
        onError: (err) => toast.error(err.errors.body ?? err.message),
      },
    );
  };

  return (
    <form className="flex gap-3" onSubmit={handleSubmit}>
      <Avatar name={user.name} size="md" className="hidden sm:inline-flex" />
      <div className="flex-1 overflow-hidden rounded-xl border border-border-default bg-surface-primary shadow-soft transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
        <label htmlFor="reply-body" className="sr-only">
          Write a reply
        </label>
        <textarea
          id="reply-body"
          rows={3}
          value={body}
          maxLength={5000}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Ctrl/Cmd + Enter sends, like most chat tools
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
          placeholder={
            isAwaitingCustomer
              ? 'Reply to the agent…'
              : ticket.status === 'resolved'
                ? 'Still having trouble? Replying reopens the ticket…'
                : 'Add more details or ask a question…'
          }
          className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-border-subtle bg-surface-secondary px-3 py-2">
          <span className="text-xs text-text-tertiary">Ctrl + Enter to send</span>
          <Button type="submit" size="sm" disabled={reply.isPending || !body.trim()}>
            {reply.isPending ? <Spinner /> : <Send className="h-3.5 w-3.5" />} Send reply
          </Button>
        </div>
      </div>
    </form>
  );
};

export const TicketDetail = () => {
  const { ticketNumber } = useParams();
  const { user } = useAuth();
  const { data: ticket, isPending, error } = useTicket(ticketNumber);
  const update = useUpdateTicket(ticketNumber);

  if (isPending) return <DetailSkeleton />;
  if (error?.status === 404 || error?.status === 400) return <NotFound number={ticketNumber} />;
  if (error) {
    return (
      <Card>
        <EmptyState title="Couldn't load this ticket" description={error.message} />
      </Card>
    );
  }

  const isClosed = ticket.status === 'closed';
  const isAwaitingCustomer = ticket.status === 'pending';
  const can = (status) => ticket.allowedStatuses.includes(status);
  const timeline = [...ticket.events].reverse();

  const changeStatus = (status, successMessage) =>
    update.mutate(
      { status },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (err) => toast.error(err.message),
      },
    );

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(ticket.number);
      toast.success(`Copied ${ticket.number}`);
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  return (
    <>
      <Link
        to="/app/tickets"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All tickets
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <button
              type="button"
              onClick={copyNumber}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border-default bg-surface-primary px-2 py-0.5 font-mono font-semibold text-text-secondary hover:text-text-primary"
              title="Copy ticket ID"
            >
              {ticket.number}
              <Copy className="h-3 w-3" />
            </button>
            <span>Opened {formatRelative(ticket.createdAt)}</span>
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

        <div className="flex shrink-0 gap-2">
          {ticket.status === 'resolved' && can('open') && (
            <Button
              variant="secondary"
              disabled={update.isPending}
              onClick={() => changeStatus('open', 'Ticket reopened')}
            >
              <RotateCcw className="h-4 w-4" /> Reopen
            </Button>
          )}
          {ticket.status === 'resolved' && can('closed') && (
            <Button
              disabled={update.isPending}
              onClick={() => changeStatus('closed', 'Thanks! Ticket closed')}
            >
              <CircleCheckBig className="h-4 w-4" /> Confirm & close
            </Button>
          )}
          {ticket.status !== 'resolved' && can('closed') && (
            <Button
              variant="danger"
              disabled={update.isPending}
              onClick={() => changeStatus('closed', 'Ticket closed')}
            >
              <Archive className="h-4 w-4" /> Close ticket
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6 px-4 py-5 sm:px-8">
        <StatusStepper ticket={ticket} />
      </Card>

      {isAwaitingCustomer && (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border border-status-warning/30 bg-status-warning-bg px-4 py-3.5"
          role="status"
        >
          <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-status-warning-fg" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-status-warning-fg">
              {ticket.assignee?.name ?? 'Support'} is waiting for your reply
            </p>
            <p className="text-text-secondary">Answer below so we can keep things moving.</p>
          </div>
          <a href="#reply" className="text-sm font-semibold text-status-warning-fg hover:underline">
            Reply
          </a>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Conversation"
              description={`${ticket.messages.length + 1} message${ticket.messages.length ? 's' : ''}`}
            />
            <div className="space-y-6 p-5 sm:p-6">
              <MessageItem
                author={{ ...ticket.customer, role: 'customer' }}
                isOwn={ticket.customer.id === user.id}
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

              {ticket.messages.length === 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border-strong px-4 py-3.5 text-sm text-text-secondary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  {ticket.assignee
                    ? `${ticket.assignee.name} will reply here soon.`
                    : 'We’re finding the right agent for your ticket.'}
                </div>
              )}
            </div>

            <div id="reply" className="scroll-mt-24 border-t border-border-default p-5 sm:p-6">
              {isClosed ? (
                <div className="flex items-center gap-3 rounded-lg bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
                  <Archive className="h-4 w-4 shrink-0" />
                  This ticket is closed. Need more help?{' '}
                  <Link
                    to="/app/tickets/new"
                    className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Open a new ticket
                  </Link>
                </div>
              ) : (
                <ReplyBox ticket={ticket} user={user} />
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Details" />
            <dl className="divide-y divide-border-default">
              <DetailRow label="Status">
                <StatusBadge status={ticket.status} />
              </DetailRow>
              <DetailRow label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </DetailRow>
              <DetailRow label="Category">{ticket.category.name}</DetailRow>
              <DetailRow label="Agent">
                <span className="inline-flex justify-end">
                  <AgentCell agent={ticket.assignee} />
                </span>
              </DetailRow>
              <DetailRow label="Created">
                <span title={formatDateTime(ticket.createdAt)}>
                  {formatRelative(ticket.createdAt)}
                </span>
              </DetailRow>
              <DetailRow label="Last update">
                <span title={formatDateTime(ticket.updatedAt)}>
                  {formatRelative(ticket.updatedAt)}
                </span>
              </DetailRow>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <div className="p-5">
              <ActivityTimeline events={timeline} viewerId={user.id} />
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
};
