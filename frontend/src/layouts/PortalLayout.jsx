import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Search } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Avatar } from '../components/ui/Avatar';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { buttonStyles } from '../components/ui/styles';
import { cn } from '../utilities/cn';
import { useAuth } from '../context/authContext';
import { loginFor } from '../utilities/portals';

const navItemClasses = ({ isActive }) =>
  cn(
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:text-brand-300'
      : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
  );

const NavList = ({ items, onNavigate }) => (
  <ul className="space-y-1">
    {items.map((item) => (
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
);

const SidebarContent = ({ config, user, onNavigate, onLogout }) => (
  <div className="flex h-full flex-col">
    <div className="flex h-16 shrink-0 items-center gap-2 px-5">
      <Logo to={config.home} size="sm" />
      {config.badge && (
        <span className="rounded-md bg-surface-tertiary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {config.badge}
        </span>
      )}
    </div>

    {config.primaryAction && (
      <div className="px-4">
        <Link
          to={config.primaryAction.to}
          onClick={onNavigate}
          className={buttonStyles({ fullWidth: true })}
          id="sidebar-primary-action"
        >
          <config.primaryAction.icon className="h-4 w-4" />
          {config.primaryAction.label}
        </Link>
      </div>
    )}

    <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-3" aria-label={config.ariaLabel}>
      <NavList items={config.nav} onNavigate={onNavigate} />

      {config.secondaryNav?.length > 0 && (
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            {config.secondaryTitle}
          </p>
          <NavList items={config.secondaryNav} onNavigate={onNavigate} />
        </div>
      )}
    </nav>

    {config.sidebarCard}

    <div className="border-t border-border-default p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar name={user.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{user.name}</p>
          <p className="truncate text-xs text-text-tertiary">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-status-danger-bg hover:text-status-danger"
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

// Search box in the top bar: submits to the portal's ticket list with ?q=
const TopSearch = ({ searchPath, placeholder }) => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    // searchPath may already carry a query string (e.g. /agent?view=all)
    const url = new URL(searchPath, window.location.origin);
    if (q) url.searchParams.set('q', q);
    navigate(`${url.pathname}${url.search}`);
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-lg border border-transparent bg-surface-tertiary pl-9 pr-3 text-sm text-text-primary transition-all placeholder:text-text-tertiary focus:border-brand-500 focus:bg-surface-primary focus:outline-none focus:ring-4 focus:ring-brand-500/15"
        id="app-search"
      />
    </form>
  );
};

/**
 * Sidebar + top bar shell shared by the customer, agent and admin portals.
 * `config` describes what differs: nav items, primary action, search target, sidebar card.
 */
export const PortalLayout = ({ config }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate(loginFor(user.role), { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-default bg-surface-primary lg:block">
        <SidebarContent config={config} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300',
            isSidebarOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={closeSidebar}
          aria-hidden="true"
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border-default bg-surface-primary shadow-float transition-transform duration-300 ease-out',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          aria-label="Sidebar"
        >
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute right-3 top-3.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent
            config={config}
            user={user}
            onNavigate={closeSidebar}
            onLogout={handleLogout}
          />
        </aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border-default bg-surface-primary/80 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary lg:hidden"
            aria-label="Open menu"
            id="btn-open-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {config.searchPath && (
            <TopSearch searchPath={config.searchPath} placeholder={config.searchPlaceholder} />
          )}

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Avatar name={user.name} size="sm" className="ml-1 lg:hidden" />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
