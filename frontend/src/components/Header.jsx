import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './ui/Logo';
import { ThemeToggle } from './ui/ThemeToggle';
import { buttonStyles } from './ui/styles';
import { cn } from '../utilities/cn';
import { useAuth } from '../context/authContext';
import { homeFor } from '../utilities/portals';

const publicLinks = [
  { to: '/', label: 'Home', id: 'home', end: true },
  { to: '/about', label: 'About', id: 'about' },
  { to: '/contact', label: 'Contact', id: 'contact' },
];

// Signed-in visitors get a shortcut back to their own portal
const appLinksFor = (role) => [
  ...publicLinks,
  { to: homeFor(role), label: 'Dashboard', id: 'dashboard' },
];

const navLinkClasses = ({ isActive }) =>
  cn(
    'relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'text-text-primary after:absolute after:-bottom-[13px] after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-brand-600'
      : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
  );

const mobileNavLinkClasses = ({ isActive }) =>
  cn(
    'block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:text-brand-300'
      : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
  );

export const Header = () => {
  const { isAuthenticated: isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // The menu remembers the path it was opened on, so navigating closes it without an effect
  const [menuOpenedAt, setMenuOpenedAt] = useState(null);
  const isMobileMenuOpen = menuOpenedAt === location.pathname;
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = isLoggedIn ? appLinksFor(user.role) : publicLinks;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled || isMobileMenuOpen
          ? 'bg-surface-primary/80 backdrop-blur-lg shadow-soft border-b border-border-default'
          : 'bg-surface-primary border-b border-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo id="header-logo" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" id="desktop-nav" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.id}
                to={link.to}
                end={link.end}
                className={navLinkClasses}
                id={`nav-${link.id}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2" id="header-actions">
            <ThemeToggle id="btn-theme-toggle" />
            <span className="mx-1 h-5 w-px bg-border-default" aria-hidden="true" />
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className={buttonStyles({ variant: 'danger', size: 'md' })}
                id="btn-logout"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className={buttonStyles({ variant: 'ghost' })} id="btn-login">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className={buttonStyles({ variant: 'primary' })}
                  id="btn-get-support"
                >
                  Get Support
                </Link>
              </>
            )}
          </div>

          {/* Mobile: theme + menu toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors duration-200 cursor-pointer"
              onClick={() => setMenuOpenedAt(isMobileMenuOpen ? null : location.pathname)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              id="btn-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav
          className="border-t border-border-default bg-surface-primary px-4 py-4 space-y-1"
          aria-label="Mobile"
        >
          {links.map((link) => (
            <NavLink
              key={link.id}
              to={link.to}
              end={link.end}
              className={mobileNavLinkClasses}
              id={`mobile-nav-${link.id}`}
            >
              {link.label}
            </NavLink>
          ))}

          {isLoggedIn ? (
            <div className="pt-2 border-t border-border-default mt-2">
              <button
                className="w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-status-danger hover:bg-status-danger-bg transition-colors duration-200 cursor-pointer"
                id="mobile-btn-logout"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 mt-2 border-t border-border-default grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className={buttonStyles({ variant: 'secondary' })}
                id="mobile-btn-login"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className={buttonStyles({ variant: 'primary' })}
                id="mobile-btn-signup"
              >
                Get Support
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
