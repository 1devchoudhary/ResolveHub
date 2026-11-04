import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox, Plus, Search } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { buttonStyles } from '../../components/ui/styles';
import { TicketRow, TicketTableHeader } from '../../components/tickets/TicketRow';
import { cn } from '../../utilities/cn';
// TODO: replace with data from your API (and show <TicketListSkeleton /> while loading)
import { tickets } from '../../mocks/customerData';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'pending', label: 'Awaiting reply' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export const MyTickets = () => {
  // UI-only tab filter over mock data — swap for a ?status= query when the API exists
  const [activeTab, setActiveTab] = useState('all');

  const countFor = (key) =>
    key === 'all' ? tickets.length : tickets.filter((t) => t.status === key).length;
  const visible = activeTab === 'all' ? tickets : tickets.filter((t) => t.status === activeTab);

  return (
    <>
      <PageHeader
        title="My tickets"
        description="Track the progress of every request you’ve raised."
        actions={
          <Link to="/app/tickets/new" className={buttonStyles()} id="btn-new-ticket">
            <Plus className="h-4 w-4" /> New ticket
          </Link>
        }
      />

      <Card className="overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-border-default">
          <div
            className="no-scrollbar flex gap-1 overflow-x-auto px-3"
            role="tablist"
            aria-label="Filter by status"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-sm font-medium transition-colors cursor-pointer',
                    isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-px text-[11px] font-semibold',
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-tertiary text-text-tertiary',
                    )}
                  >
                    {countFor(tab.key)}
                  </span>
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar (visual only) */}
        <div className="flex flex-col gap-3 border-b border-border-default px-5 py-3 sm:flex-row sm:items-center">
          <div className="flex-1 sm:max-w-xs">
            <Input
              icon={Search}
              type="search"
              placeholder="Search by subject or ID…"
              aria-label="Search tickets"
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label
              htmlFor="ticket-sort"
              className="text-xs font-medium text-text-tertiary whitespace-nowrap"
            >
              Sort by
            </label>
            <Select id="ticket-sort" defaultValue="updated">
              <option value="updated">Recently updated</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority</option>
            </Select>
          </div>
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No tickets here"
            description="Nothing matches this filter. Try another tab, or raise a new ticket if you need help."
            action={
              <Link to="/app/tickets/new" className={buttonStyles({ variant: 'secondary' })}>
                <Plus className="h-4 w-4" /> New ticket
              </Link>
            }
          />
        ) : (
          <>
            <TicketTableHeader />
            <div className="divide-y divide-border-default">
              {visible.map((ticket) => (
                <TicketRow key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </>
        )}

        {/* Pagination (visual) */}
        <div className="flex items-center justify-between border-t border-border-default bg-surface-secondary px-5 py-3">
          <p className="text-xs text-text-tertiary">
            Showing <span className="font-semibold text-text-secondary">{visible.length}</span> of{' '}
            <span className="font-semibold text-text-secondary">{tickets.length}</span> tickets
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="secondary" size="sm" disabled aria-label="Next page">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
