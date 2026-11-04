import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox, Search, TriangleAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Field';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { TicketRow, TicketTableHeader } from './TicketRow';
import { TicketListSkeleton } from './TicketListSkeleton';
import { PRIORITY_META } from '../ui/ticketMeta';
import { useTickets, useTicketStats } from '../../hooks/queries/useTickets';
import { cn } from '../../utilities/cn';

const PAGE_SIZE = 15;

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'pending', label: 'Awaiting reply' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const SORTS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'priority', label: 'Priority' },
];

/**
 * Filterable, searchable, paginated ticket list. All filters live in the URL
 * (?status=&q=&sort=&page=…), so views are shareable, survive reloads and the back button
 * works. `fixedParams` are always applied (e.g. assignee=me for an agent's tab).
 */
export const TicketList = ({
  basePath,
  person = 'assignee',
  fixedParams = {},
  showPriorityFilter = false,
  emptyAction,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'updated';
  const priority = searchParams.get('priority') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchDraft, setSearchDraft] = useState(q);
  // Keep the input in sync when ?q= changes from elsewhere (e.g. the top-bar search)
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setSearchDraft(q);
  }

  // An explicit status tab wins over the view's default (e.g. "active" for an agent's own tickets)
  const params = {
    ...fixedParams,
    q,
    sort,
    priority,
    page,
    limit: PAGE_SIZE,
    status: status || fixedParams.status,
  };
  const { data, isPending, isError, isPlaceholderData, refetch } = useTickets(params);
  const { data: stats } = useTicketStats();

  // Changing any filter goes back to page 1
  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries({ page: '', ...changes })) {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next, { replace: true });
  };

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countFor = (key) =>
    key === ''
      ? Object.values(stats?.byStatus ?? {}).reduce((sum, n) => sum + n, 0)
      : (stats?.byStatus?.[key] ?? 0);
  const showTabCounts = Object.keys(fixedParams).length === 0;

  return (
    <Card className="overflow-hidden">
      {/* Status tabs */}
      <div className="border-b border-border-default">
        <div
          className="no-scrollbar flex gap-1 overflow-x-auto px-3"
          role="tablist"
          aria-label="Filter by status"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.key;
            return (
              <button
                key={tab.key || 'all'}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => update({ status: tab.key })}
                className={cn(
                  'relative flex shrink-0 cursor-pointer items-center gap-2 px-3 py-3.5 text-sm font-medium transition-colors',
                  isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {tab.key === '' && fixedParams.status === 'active' ? 'Active' : tab.label}
                {showTabCounts && stats && (
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
                )}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border-default px-5 py-3 sm:flex-row sm:items-center">
        <form
          role="search"
          className="flex-1 sm:max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: searchDraft.trim() });
          }}
        >
          <Input
            icon={Search}
            type="search"
            value={searchDraft}
            onChange={(e) => {
              setSearchDraft(e.target.value);
              if (e.target.value === '' && q) update({ q: '' });
            }}
            placeholder="Search by keyword or RH-number…"
            aria-label="Search tickets"
          />
        </form>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {showPriorityFilter && (
            <Select
              aria-label="Filter by priority"
              value={priority}
              onChange={(e) => update({ priority: e.target.value })}
            >
              <option value="">Any priority</option>
              {Object.entries(PRIORITY_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
          )}
          <label
            htmlFor="ticket-sort"
            className="text-xs font-medium whitespace-nowrap text-text-tertiary"
          >
            Sort by
          </label>
          <Select id="ticket-sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* List */}
      {isPending ? (
        <TicketListSkeleton />
      ) : isError ? (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load tickets"
          description="Something went wrong on our side. Please try again."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={q ? `No tickets match “${q}”` : 'No tickets here'}
          description={
            q
              ? 'Try different keywords, or search by ticket number like RH-1042.'
              : 'Nothing matches this filter right now.'
          }
          action={emptyAction}
        />
      ) : (
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          <TicketTableHeader personLabel={person === 'customer' ? 'Customer' : 'Agent'} />
          <div className="divide-y divide-border-default">
            {data.items.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} basePath={basePath} person={person} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border-default bg-surface-secondary px-5 py-3">
        <p className="text-xs text-text-tertiary">
          {total === 0 ? (
            'No results'
          ) : (
            <>
              Showing{' '}
              <span className="font-semibold text-text-secondary">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </span>{' '}
              of <span className="font-semibold text-text-secondary">{total}</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => update({ page: page - 1 })}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => update({ page: page + 1 })}
            aria-label="Next page"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
