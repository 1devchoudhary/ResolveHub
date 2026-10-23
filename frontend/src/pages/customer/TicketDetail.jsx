import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Archive,
  Copy,
  Hourglass,
  Paperclip,
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
import { buttonStyles } from '../../components/ui/styles';
import { StatusStepper } from '../../components/tickets/StatusStepper';
import { MessageItem } from '../../components/tickets/MessageItem';
import { ActivityTimeline } from '../../components/tickets/ActivityTimeline';
import { AttachmentTile } from '../../components/tickets/AttachmentTile';
import { AgentCell } from '../../components/tickets/TicketRow';
import { formatDateTime, formatRelative } from '../../utilities/format';
// TODO: fetch the ticket from your API using ticketNumber
import { currentUser, getTicketByNumber } from '../../mocks/customerData';

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-3">
    <dt className="text-sm text-text-tertiary">{label}</dt>
    <dd className="min-w-0 text-right text-sm font-medium text-text-primary">{children}</dd>
  </div>
);

export const TicketDetail = () => {
  const { ticketNumber } = useParams();
  const ticket = getTicketByNumber(ticketNumber);

  if (!ticket) {
    return (
      <Card>
        <EmptyState
          icon={SearchX}
          title="Ticket not found"
          description={`We couldn’t find a ticket with ID “${ticketNumber}”. It may have been removed, or the link is wrong.`}
          action={
            <Link to="/app/tickets" className={buttonStyles({ variant: 'secondary' })}>
              <ArrowLeft className="h-4 w-4" /> Back to tickets
            </Link>
          }
        />
      </Card>
    );
  }

  const isClosed = ticket.status === 'closed';
  const isResolved = ticket.status === 'resolved';
  const isAwaitingCustomer = ticket.status === 'pending';
  const allAttachments = [...ticket.attachments, ...ticket.messages.flatMap((m) => m.attachments)];
  const timeline = [...ticket.activity].reverse();

  return (
    <>
      <Link
        to="/app/tickets"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All tickets
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface-primary px-2 py-0.5 font-mono font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
              title="Copy ticket ID"
            >
              {ticket.ticketNumber}
              <Copy className="h-3 w-3" />
            </button>
            <span>Opened {formatRelative(ticket.createdAt)}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary text-balance">{ticket.subject}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <Badge tone="neutral">{ticket.category}</Badge>
          </div>
        </div>

        {/* Actions (visual only) */}
        <div className="flex shrink-0 gap-2">
          {isResolved && (
            <>
              <Button variant="secondary">
                <RotateCcw className="h-4 w-4" /> Reopen
              </Button>
              <Button>
                <CircleCheckBig className="h-4 w-4" /> Confirm & close
              </Button>
            </>
          )}
          {!isResolved && !isClosed && (
            <Button variant="danger">
              <Archive className="h-4 w-4" /> Close ticket
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card className="mb-6 px-4 py-5 sm:px-8">
        <StatusStepper ticket={ticket} />
      </Card>

      {isAwaitingCustomer && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-status-warning/30 bg-status-warning-bg px-4 py-3.5" role="status">
          <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-status-warning-fg" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-status-warning-fg">{ticket.assignedTo?.name} is waiting for your reply</p>
            <p className="text-text-secondary">Answer below so we can keep things moving.</p>
          </div>
          <a href="#reply" className="text-sm font-semibold text-status-warning-fg hover:underline">
            Reply
          </a>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Conversation"
              description={`${ticket.messages.length + 1} message${ticket.messages.length ? 's' : ''}`}
            />
            <div className="space-y-6 p-5 sm:p-6">
              {/* Original request */}
              <MessageItem
                author={{ ...currentUser }}
                isOwn
                label="Original request"
                body={ticket.description}
                createdAt={ticket.createdAt}
                attachments={ticket.attachments}
              />

              {ticket.messages.map((message) => (
                <MessageItem
                  key={message._id}
                  author={message.author}
                  isOwn={message.author._id === currentUser._id}
                  body={message.body}
                  createdAt={message.createdAt}
                  attachments={message.attachments}
                />
              ))}

              {ticket.messages.length === 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border-strong px-4 py-3.5 text-sm text-text-secondary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  {ticket.assignedTo
                    ? `${ticket.assignedTo.name} will reply here soon.`
                    : 'We’re finding the right agent for your ticket.'}
                </div>
              )}
            </div>

            {/* Reply composer (visual only) */}
            <div id="reply" className="scroll-mt-24 border-t border-border-default p-5 sm:p-6">
              {isClosed ? (
                <div className="flex items-center gap-3 rounded-lg bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
                  <Archive className="h-4 w-4 shrink-0" />
                  This ticket is closed. Need more help?{' '}
                  <Link to="/app/tickets/new" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                    Open a new ticket
                  </Link>
                </div>
              ) : (
                <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
                  <Avatar name={currentUser.name} size="md" className="hidden sm:inline-flex" />
                  <div className="flex-1 overflow-hidden rounded-xl border border-border-default bg-surface-primary shadow-soft focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15 transition-all">
                    <label htmlFor="reply-body" className="sr-only">
                      Write a reply
                    </label>
                    <textarea
                      id="reply-body"
                      rows={3}
                      placeholder={isAwaitingCustomer ? 'Reply to the agent…' : 'Add more details or ask a question…'}
                      className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
                    />
                    <div className="flex items-center justify-between border-t border-border-subtle bg-surface-secondary px-2 py-2">
                      <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-text-secondary hover:bg-surface-tertiary hover:text-text-primary">
                        <Paperclip className="h-4 w-4" />
                        Attach
                        <input type="file" accept="image/*" multiple className="sr-only" />
                      </label>
                      <Button type="submit" size="sm">
                        <Send className="h-3.5 w-3.5" /> Send reply
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
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
              <DetailRow label="Category">{ticket.category}</DetailRow>
              <DetailRow label="Agent">
                <span className="inline-flex justify-end">
                  <AgentCell agent={ticket.assignedTo} />
                </span>
              </DetailRow>
              <DetailRow label="Created">
                <span title={formatDateTime(ticket.createdAt)}>{formatRelative(ticket.createdAt)}</span>
              </DetailRow>
              <DetailRow label="Last update">
                <span title={formatDateTime(ticket.updatedAt)}>{formatRelative(ticket.updatedAt)}</span>
              </DetailRow>
            </dl>
          </Card>

          {allAttachments.length > 0 && (
            <Card>
              <CardHeader title="Attachments" description={`${allAttachments.length} file${allAttachments.length > 1 ? 's' : ''}`} />
              <div className="space-y-2 p-4">
                {allAttachments.map((file) => (
                  <AttachmentTile key={file.name} name={file.name} size={file.size} className="max-w-none" />
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Activity" />
            <div className="p-5">
              <ActivityTimeline events={timeline} viewerId={currentUser._id} />
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
};
