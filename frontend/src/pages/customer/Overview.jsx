import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CircleCheckBig,
  Clock3,
  Hourglass,
  Inbox,
  Plus,
  Timer,
  MessageSquareReply,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { buttonStyles } from '../../components/ui/styles';
import { ActivityTimeline } from '../../components/tickets/ActivityTimeline';
import { formatRelative } from '../../utilities/format';
import { cn } from '../../utilities/cn';
// TODO: replace with data from your API
import { currentUser, tickets } from '../../mocks/customerData';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const StatCard = ({ icon: Icon, label, value, hint, tone }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', tone)}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
    </div>
    <p className="mt-3 text-3xl font-bold tracking-tight text-text-primary">{value}</p>
    <p className="mt-1 text-xs text-text-tertiary">{hint}</p>
  </Card>
);

export const Overview = () => {
  const firstName = currentUser.name.split(' ')[0];
  const active = tickets.filter((t) => ['open', 'in-progress'].includes(t.status));
  const awaiting = tickets.filter((t) => t.status === 'pending');
  const resolved = tickets.filter((t) => ['resolved', 'closed'].includes(t.status));
  const recent = [...tickets]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);
  const recentActivity = tickets
    .flatMap((t) => t.activity.map((e) => ({ ...e, _id: `${t._id}-${e._id}` })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Here’s what’s happening with your support requests."
        actions={
          <Link to="/app/tickets/new" className={buttonStyles()}>
            <Plus className="h-4 w-4" /> New ticket
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Timer}
          label="Active"
          value={active.length}
          hint="Open or being worked on"
          tone="bg-brand-50 text-brand-600 dark:text-brand-300"
        />
        <StatCard
          icon={Hourglass}
          label="Awaiting you"
          value={awaiting.length}
          hint="Agent needs your reply"
          tone="bg-status-warning-bg text-status-warning-fg"
        />
        <StatCard
          icon={CircleCheckBig}
          label="Resolved"
          value={resolved.length}
          hint="All time"
          tone="bg-status-success-bg text-status-success-fg"
        />
        <StatCard
          icon={Clock3}
          label="Avg. first reply"
          value="1h 42m"
          hint="Last 30 days"
          tone="bg-status-info-bg text-status-info-fg"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Needs attention */}
          <Card className="overflow-hidden">
            <CardHeader
              icon={MessageSquareReply}
              title="Needs your attention"
              description="Tickets where an agent is waiting on you"
            />
            {awaiting.length === 0 ? (
              <EmptyState
                icon={CircleCheckBig}
                title="You’re all caught up"
                description="No agent is waiting on a reply from you right now."
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-border-default">
                {awaiting.map((ticket) => (
                  <li key={ticket._id}>
                    <Link
                      to={`/app/tickets/${ticket.ticketNumber}`}
                      className="group flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-warning-bg text-status-warning-fg">
                        <Hourglass className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          <span className="font-mono">{ticket.ticketNumber}</span> ·{' '}
                          {ticket.assignedTo?.name} replied {formatRelative(ticket.updatedAt)}
                        </p>
                      </div>
                      <span className="hidden items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 sm:inline-flex">
                        Reply{' '}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Recent tickets */}
          <Card className="overflow-hidden">
            <CardHeader
              icon={Inbox}
              title="Recent tickets"
              description="Your latest updates"
              action={
                <Link
                  to="/app/tickets"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  View all
                </Link>
              }
            />
            <ul className="divide-y divide-border-default">
              {recent.map((ticket) => (
                <li key={ticket._id}>
                  <Link
                    to={`/app/tickets/${ticket.ticketNumber}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-secondary transition-colors"
                  >
                    <PriorityBadge priority={ticket.priority} showLabel={false} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        <span className="font-mono">{ticket.ticketNumber}</span> · updated{' '}
                        {formatRelative(ticket.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Recent activity" description="Across all your tickets" />
            <div className="p-5">
              <ActivityTimeline events={recentActivity} viewerId={currentUser._id} />
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5">
            <div
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/15 blur-2xl"
              aria-hidden="true"
            />
            <p className="relative text-sm font-semibold text-text-primary">Tip: add screenshots</p>
            <p className="relative mt-1 text-sm text-text-secondary">
              Tickets with a screenshot are resolved{' '}
              <span className="font-semibold text-text-primary">40% faster</span> on average.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
};
