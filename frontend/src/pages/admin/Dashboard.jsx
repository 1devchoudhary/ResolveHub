import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CircleCheckBig, Clock3, Inbox, Timer, TicketPlus, UserX } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { STATUS_ORDER } from '../../components/ui/ticketMeta';
import { useAnalytics } from '../../hooks/queries/useAdmin';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utilities/cn';
import { formatDuration } from '../../utilities/format';

const RANGES = [7, 30, 90];

// Categorical slots 1-2 of the validated data-viz palette, stepped separately per theme
// (not an automatic inversion). Both pairs pass the CVD and contrast checks on our surfaces.
const CHART_COLORS = {
  light: { created: '#2a78d6', resolved: '#eb6834', grid: '#e2e8f0', axis: '#64748b' },
  dark: { created: '#3987e5', resolved: '#d95926', grid: '#1e293b', axis: '#94a3b8' },
};

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-xs shadow-medium">
      <p className="mb-1 font-semibold text-text-primary">{shortDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-text-secondary">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="font-semibold text-text-primary">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const Legend = ({ items }) => (
  <ul className="flex flex-wrap gap-4 text-xs text-text-secondary">
    {items.map((item) => (
      <li key={item.label} className="flex items-center gap-1.5">
        <span className="h-0.5 w-4 rounded-full" style={{ background: item.color }} />
        {item.label}
      </li>
    ))}
  </ul>
);

const VolumeChart = ({ daily, colors }) => {
  const [asTable, setAsTable] = useState(false);
  const totals = daily.reduce(
    (sum, day) => ({ created: sum.created + day.created, resolved: sum.resolved + day.resolved }),
    { created: 0, resolved: 0 },
  );

  return (
    <Card>
      <CardHeader
        title="Ticket volume"
        description={`${totals.created} created · ${totals.resolved} resolved`}
        action={
          <button
            type="button"
            onClick={() => setAsTable(!asTable)}
            className="cursor-pointer text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            {asTable ? 'Show chart' : 'Show table'}
          </button>
        }
      />
      <div className="p-5">
        <Legend
          items={[
            { label: 'Created', color: colors.created },
            { label: 'Resolved', color: colors.resolved },
          ]}
        />
        {asTable ? (
          <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-border-default">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-secondary text-xs text-text-tertiary">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-right font-semibold">Created</th>
                  <th className="px-3 py-2 text-right font-semibold">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default text-text-secondary">
                {[...daily].reverse().map((day) => (
                  <tr key={day.date}>
                    <td className="px-3 py-1.5">{shortDate(day.date)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{day.created}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{day.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 h-72" role="img" aria-label="Tickets created and resolved per day">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="fill-created" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.created} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={colors.created} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fill: colors.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: colors.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: colors.axis, strokeDasharray: '3 3' }}
                />
                <Area
                  type="linear"
                  dataKey="created"
                  name="Created"
                  stroke={colors.created}
                  strokeWidth={2}
                  fill="url(#fill-created)"
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
                <Area
                  type="linear"
                  dataKey="resolved"
                  name="Resolved"
                  stroke={colors.resolved}
                  strokeWidth={2}
                  fill="transparent"
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};

const CategoryChart = ({ categories, colors }) => (
  <Card>
    <CardHeader title="Tickets by category" description="Created in this period" />
    <div className="h-64 p-5" role="img" aria-label="Tickets created per category">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={categories}
          layout="vertical"
          margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
          barCategoryGap={8}
        >
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: colors.grid, opacity: 0.5 }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-xs shadow-medium">
                  <span className="font-semibold text-text-primary">{payload[0].payload.name}</span>
                  <span className="text-text-secondary">: {payload[0].value} tickets</span>
                </div>
              ) : null
            }
          />
          <Bar dataKey="tickets" fill={colors.created} radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList dataKey="tickets" position="right" fill={colors.axis} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const StatusCard = ({ byStatus }) => {
  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0) || 1;
  return (
    <Card>
      <CardHeader title="All tickets by status" description="Right now" />
      <ul className="divide-y divide-border-default">
        {STATUS_ORDER.map((status) => {
          const count = byStatus[status] ?? 0;
          return (
            <li key={status} className="flex items-center gap-3 px-5 py-3">
              <StatusBadge status={status} />
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-tertiary">
                <span
                  className="block h-full rounded-full bg-text-tertiary/50"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </span>
              <span className="w-8 text-right text-sm font-semibold tabular-nums text-text-primary">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

const AgentTable = ({ agents }) => (
  <Card className="overflow-hidden">
    <CardHeader
      title="Agent performance"
      description="Workload now, results in this period"
      action={
        <Link
          to="/admin/team"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Manage team
        </Link>
      }
    />
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-secondary text-[11px] uppercase tracking-wider text-text-tertiary">
          <tr>
            <th className="px-5 py-2.5 text-left font-semibold">Agent</th>
            <th className="px-5 py-2.5 text-right font-semibold">Active</th>
            <th className="px-5 py-2.5 text-right font-semibold">Resolved</th>
            <th className="px-5 py-2.5 text-right font-semibold">Median first reply</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {agents.map((agent) => (
            <tr key={agent.id} className={cn(!agent.isActive && 'opacity-60')}>
              <td className="px-5 py-3">
                <span className="flex items-center gap-3">
                  <Avatar name={agent.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block font-medium text-text-primary">{agent.name}</span>
                    <span className="block text-xs text-text-tertiary">
                      {agent.isActive ? agent.email : 'Deactivated'}
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-text-secondary">
                {agent.active}
              </td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums text-text-primary">
                {agent.resolved}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-text-secondary">
                {formatDuration(agent.medianFirstResponseMinutes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export const Dashboard = () => {
  const [days, setDays] = useState(30);
  const { data, isPending } = useAnalytics(days);
  const { theme } = useTheme();
  const colors = CHART_COLORS[theme];
  const summary = data?.summary;

  return (
    <>
      <PageHeader
        title="Support dashboard"
        description="How the team is doing, at a glance."
        actions={
          <div
            className="inline-flex rounded-lg border border-border-default bg-surface-primary p-1 shadow-soft"
            role="group"
            aria-label="Date range"
          >
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                aria-pressed={days === range}
                onClick={() => setDays(range)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  days === range
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {range} days
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Timer}
          label="Active"
          value={summary?.active}
          hint="Open, in progress or pending"
          tone="bg-brand-50 text-brand-600 dark:text-brand-300"
        />
        <StatCard
          icon={UserX}
          label="Unassigned"
          value={summary?.unassigned}
          hint="Active, no owner"
          tone="bg-status-warning-bg text-status-warning-fg"
        />
        <StatCard
          icon={TicketPlus}
          label="Created"
          value={summary?.created}
          hint={`Last ${days} days`}
          tone="bg-status-info-bg text-status-info-fg"
        />
        <StatCard
          icon={CircleCheckBig}
          label="Resolved"
          value={summary?.resolved}
          hint={`Last ${days} days`}
          tone="bg-status-success-bg text-status-success-fg"
        />
        <StatCard
          icon={Clock3}
          label="First reply"
          value={summary && formatDuration(summary.medianFirstResponseMinutes)}
          hint="Median"
          tone="bg-status-info-bg text-status-info-fg"
        />
        <StatCard
          icon={Inbox}
          label="Resolution"
          value={summary && formatDuration(summary.medianResolutionMinutes)}
          hint="Median time to resolve"
          tone="bg-status-neutral-bg text-status-neutral-fg"
        />
      </div>

      {isPending ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VolumeChart daily={data.daily} colors={colors} />
            </div>
            <StatusCard byStatus={data.byStatus} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <CategoryChart categories={data.categories} colors={colors} />
            </div>
            <div className="lg:col-span-3">
              <AgentTable agents={data.agents} />
            </div>
          </div>
        </>
      )}
    </>
  );
};
