import { Inbox, Settings } from 'lucide-react';
import { PortalLayout } from './PortalLayout';

export const AgentLayout = () => (
  <PortalLayout
    config={{
      home: '/agent',
      badge: 'Agent',
      ariaLabel: 'Agent portal',
      nav: [
        { to: '/agent', label: 'Queue', icon: Inbox, end: true },
        { to: '/agent/settings', label: 'Settings', icon: Settings },
      ],
      searchPath: '/agent',
      searchPlaceholder: 'Search all tickets…',
    }}
  />
);
