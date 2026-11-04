import { LayoutDashboard, Ticket, Settings, BookOpen, LifeBuoy, Plus } from 'lucide-react';
import { PortalLayout } from './PortalLayout';
import { useTicketStats } from '../hooks/queries/useTickets';

const SupportOnlineCard = () => (
  <div className="mx-4 mb-4 rounded-xl border border-border-default bg-linear-to-br from-brand-50 to-surface-primary p-4">
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-status-success" />
      </span>
      <p className="text-xs font-semibold text-text-primary">Support is online</p>
    </div>
    <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
      Typical first reply in <span className="font-semibold text-text-primary">~2 hours</span>.
    </p>
  </div>
);

export const CustomerLayout = () => {
  const { data: stats } = useTicketStats();

  return (
    <PortalLayout
      config={{
        home: '/app',
        ariaLabel: 'Customer portal',
        primaryAction: { to: '/app/tickets/new', label: 'New ticket', icon: Plus },
        nav: [
          { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
          { to: '/app/tickets', label: 'My tickets', icon: Ticket, count: stats?.active },
          { to: '/app/settings', label: 'Settings', icon: Settings },
        ],
        secondaryTitle: 'Resources',
        secondaryNav: [
          { to: '/', label: 'Help center', icon: BookOpen, end: true },
          { to: '/contact', label: 'Contact support', icon: LifeBuoy, end: true },
        ],
        searchPath: '/app/tickets',
        searchPlaceholder: 'Search your tickets…',
        sidebarCard: <SupportOnlineCard />,
      }}
    />
  );
};
