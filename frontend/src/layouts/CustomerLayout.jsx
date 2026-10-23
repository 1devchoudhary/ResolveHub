import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Settings,
  BookOpen,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Plus,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Avatar } from '../components/ui/Avatar';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { buttonStyles } from '../components/ui/styles';
import { cn } from '../utilities/cn';
// TODO: replace mock user/tickets with your auth context + API data
import { currentUser, tickets } from '../mocks/customerData';

const activeCount = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;

const mainNav = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/tickets', label: 'My tickets', icon: Ticket, count: activeCount },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const resourceNav = [
  { to: '/', label: 'Help center', icon: BookOpen },
  { to: '/contact', label: 'Contact support', icon: LifeBuoy },
];

const navItemClasses = ({ isActive }) =>
  cn(
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:text-brand-300'
      : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
  );

const SidebarContent = ({ onNavigate }) => (
  <div className="flex h-full flex-col">
    <div className="flex h-16 shrink-0 items-center px-5">
      <Logo to="/app" size="sm" />
    </div>

    <div className="px-4">
      <Link
        to="/app/tickets/new"
        onClick={onNavigate}
        className={buttonStyles({ fullWidth: true })}
        id="sidebar-new-ticket"
      >
        <Plus className="h-4 w-4" />
        New ticket
      </Link>
    </div>

    <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-3" aria-label="Customer portal">
      <ul className="space-y-1">
        {mainNav.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={navItemClasses} onClick={onNavigate}>
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.count > 0 && (
                <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                  {item.count}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div>
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Resources</p>
        <ul className="space-y-1">
          {resourceNav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end className={navItemClasses} onClick={onNavigate}>
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>

    {/* Response-time card */}
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

    {/* User card */}
    <div className="border-t border-border-default p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar name={currentUser.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{currentUser.name}</p>
          <p className="truncate text-xs text-text-tertiary">{currentUser.email}</p>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-status-danger-bg hover:text-status-danger transition-colors cursor-pointer"
          aria-label="Log out"
          title="Log out"
          id="sidebar-logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

export const CustomerLayout = () => {
  // UI-only: mobile drawer open/closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-default bg-surface-primary lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn(
            'absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300',
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeSidebar}
          aria-hidden="true"
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border-default bg-surface-primary shadow-float transition-transform duration-300 ease-out',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="Sidebar"
        >
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute right-3 top-3.5 flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavigate={closeSidebar} />
        </aside>
      </div>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border-default bg-surface-primary/80 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary lg:hidden cursor-pointer"
            aria-label="Open menu"
            id="btn-open-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search (visual only for now) */}
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="search"
              placeholder="Search tickets…"
              className="h-9 w-full rounded-lg border border-transparent bg-surface-tertiary pl-9 pr-14 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:bg-surface-primary focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all"
              id="app-search"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border-default bg-surface-primary px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary sm:block">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Notifications"
              id="btn-notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-status-danger ring-2 ring-surface-primary" />
            </button>
            <Avatar name={currentUser.name} size="sm" className="ml-1 lg:hidden" />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
