import { useSearchParams } from 'react-router-dom';
import { Flame, Hourglass, Inbox, UserRound } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { TicketList } from '../../components/tickets/TicketList';
import { useTicketStats } from '../../hooks/queries/useTickets';
import { useAuth } from '../../context/authContext';
import { cn } from '../../utilities/cn';

// "Views" narrow the queue by assignment; status/priority/search filters stack on top
const VIEWS = {
  agent: [
    { key: 'mine', label: 'Assigned to me', params: { assignee: 'me', status: 'active' } },
    { key: 'unassigned', label: 'Unassigned', params: { assignee: 'unassigned' } },
    { key: 'all', label: 'All tickets', params: {} },
  ],
  admin: [
    { key: 'all', label: 'All tickets', params: {} },
    { key: 'unassigned', label: 'Unassigned', params: { assignee: 'unassigned' } },
  ],
};

// Shared by the agent queue and the admin "All tickets" page
export const TicketQueue = ({ portal = 'agent' }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: stats } = useTicketStats();

  const views = VIEWS[portal];
  const view = views.find((v) => v.key === searchParams.get('view')) ?? views[0];

  const selectView = (key) => {
    const next = new URLSearchParams();
    if (key !== views[0].key) next.set('view', key);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader
        title={portal === 'agent' ? `Your queue, ${user.name.split(' ')[0]}` : 'All tickets'}
        description={
          portal === 'agent'
            ? 'Work through your assigned tickets, then pick up unassigned ones.'
            : 'Every ticket across the team. Open one to reassign or change it.'
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={UserRound}
          label="Assigned to me"
          value={stats?.mine}
          hint="Active tickets in my name"
          tone="bg-brand-50 text-brand-600 dark:text-brand-300"
        />
        <StatCard
          icon={Inbox}
          label="Unassigned"
          value={stats?.unassigned}
          hint="Waiting for an owner"
          tone="bg-status-info-bg text-status-info-fg"
        />
        <StatCard
          icon={Flame}
          label="Urgent"
          value={stats?.urgent}
          hint="Active, urgent priority"
          tone="bg-status-danger-bg text-status-danger-fg"
        />
        <StatCard
          icon={Hourglass}
          label="Awaiting customer"
          value={stats?.awaitingCustomer}
          hint="Replied, waiting on them"
          tone="bg-status-warning-bg text-status-warning-fg"
        />
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-border-default bg-surface-primary p-1 shadow-soft">
        {views.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => selectView(option.key)}
            aria-pressed={view.key === option.key}
            className={cn(
              'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view.key === option.key
                ? 'bg-brand-600 text-white shadow-soft'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <TicketList
        key={view.key}
        basePath={`/${portal}/tickets`}
        person="customer"
        fixedParams={view.params}
        showPriorityFilter
      />
    </>
  );
};
