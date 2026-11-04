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
import { Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { buttonStyles } from '../../components/ui/styles';
import { ActivityTimeline } from '../../components/tickets/ActivityTimeline';
import { useAuth } from '../../context/authContext';
import { useTicketActivity, useTicketStats, useTickets } from '../../hooks/queries/useTickets';
import { formatDuration, formatRelative } from '../../utilities/format';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const ListSkeleton = () => (
  <div className="space-y-4 p-5">
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);

export const Overview = () => {
  const { user } = useAuth();
  const firstName = user.name.split(' ')[0];

  const { data: stats } = useTicketStats();
  const awaiting = useTickets({ status: 'pending', sort: 'updated', limit: 5 });
  const recent = useTickets({ sort: 'updated', limit: 5 });
  const activity = useTicketActivity(6);

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Timer}
          label="Active"
          value={stats?.active}
          hint="Open or being worked on"
          tone="bg-brand-50 text-brand-600 dark:text-brand-300"
        />
        <StatCard
          icon={Hourglass}
          label="Awaiting you"
          value={stats?.awaitingCustomer}
          hint="An agent needs your reply"
          tone="bg-status-warning-bg text-status-warning-fg"
        />
        <StatCard
          icon={CircleCheckBig}
          label="Resolved"
          value={stats?.resolved}
          hint="All time"
          tone="bg-status-success-bg text-status-success-fg"
        />
        <StatCard
          icon={Clock3}
          label="Typical first reply"
          value={stats && formatDuration(stats.medianFirstResponseMinutes)}
          hint="Median, last 30 days"
          tone="bg-status-info-bg text-status-info-fg"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader
              icon={MessageSquareReply}
              title="Needs your attention"
              description="Tickets where an agent is waiting on you"
            />
            {awaiting.isPending ? (
              <ListSkeleton />
            ) : awaiting.data.items.length === 0 ? (
              <EmptyState
                icon={CircleCheckBig}
                title="You’re all caught up"
                description="No agent is waiting on a reply from you right now."
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-border-default">
                {awaiting.data.items.map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      to={`/app/tickets/${ticket.number}`}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-secondary"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-warning-bg text-status-warning-fg">
                        <Hourglass className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          <span className="font-mono">{ticket.number}</span> ·{' '}
                          {ticket.assignee?.name ?? 'Support'} replied{' '}
                          {formatRelative(ticket.updatedAt)}
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
            {recent.isPending ? (
              <ListSkeleton />
            ) : recent.data.items.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No tickets yet"
                description="When you need help, open a ticket and we’ll take it from there."
                action={
                  <Link to="/app/tickets/new" className={buttonStyles({ variant: 'secondary' })}>
                    <Plus className="h-4 w-4" /> New ticket
                  </Link>
                }
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-border-default">
                {recent.data.items.map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      to={`/app/tickets/${ticket.number}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-secondary"
                    >
                      <PriorityBadge priority={ticket.priority} showLabel={false} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          <span className="font-mono">{ticket.number}</span> · updated{' '}
                          {formatRelative(ticket.updatedAt)}
                        </p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Recent activity" description="Across all your tickets" />
            <div className="p-5">
              {activity.isPending ? (
                <ListSkeleton />
              ) : activity.data.length === 0 ? (
                <p className="text-sm text-text-tertiary">Nothing yet.</p>
              ) : (
                <ActivityTimeline
                  events={activity.data}
                  viewerId={user.id}
                  ticketBasePath="/app/tickets"
                />
              )}
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5">
            <div
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/15 blur-2xl"
              aria-hidden="true"
            />
            <p className="relative text-sm font-semibold text-text-primary">
              Tip: one issue per ticket
            </p>
            <p className="relative mt-1 text-sm text-text-secondary">
              Separate tickets get routed to the right expert and resolved{' '}
              <span className="font-semibold text-text-primary">much faster</span>.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
};
