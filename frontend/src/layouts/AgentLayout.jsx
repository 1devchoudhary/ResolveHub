import { Inbox, Settings } from 'lucide-react';
import { PortalLayout } from './PortalLayout';
import { useTicketStats } from '../hooks/queries/useTickets';

export const AgentLayout = () => {
  const { data: stats } = useTicketStats();

  return (
    <PortalLayout
      config={{
        home: '/agent',
        badge: 'Agent',
        ariaLabel: 'Agent portal',
        nav: [
          { to: '/agent', label: 'Queue', icon: Inbox, end: true, count: stats?.mine },
          { to: '/agent/settings', label: 'Settings', icon: Settings },
        ],
        // Search covers every ticket, not just the agent's own
        searchPath: '/agent?view=all',
        searchPlaceholder: 'Search all tickets…',
      }}
    />
  );
};
