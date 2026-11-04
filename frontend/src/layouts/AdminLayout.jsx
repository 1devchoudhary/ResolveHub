import { BarChart3, Inbox, Settings, Tags, Users } from 'lucide-react';
import { PortalLayout } from './PortalLayout';

export const AdminLayout = () => (
  <PortalLayout
    config={{
      home: '/admin',
      badge: 'Admin',
      ariaLabel: 'Admin portal',
      nav: [
        { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
        { to: '/admin/tickets', label: 'All tickets', icon: Inbox },
        { to: '/admin/team', label: 'Team', icon: Users },
        { to: '/admin/categories', label: 'Categories', icon: Tags },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ],
      searchPath: '/admin/tickets',
      searchPlaceholder: 'Search all tickets…',
    }}
  />
);
