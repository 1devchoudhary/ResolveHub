import { cn } from '../../utilities/cn';

// Shared class recipes. Kept in a .js file so both <button> and <Link>
// can use the exact same look: <Link className={buttonStyles({ variant: 'secondary' })} />

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary';

const BUTTON_VARIANTS = {
  primary: 'bg-brand-600 text-text-inverse shadow-soft hover:bg-brand-700 hover:shadow-medium',
  secondary:
    'border border-border-default bg-surface-primary text-text-primary shadow-soft hover:bg-surface-tertiary hover:border-border-strong',
  ghost: 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
  danger:
    'border border-border-default bg-surface-primary text-status-danger shadow-soft hover:bg-status-danger-bg hover:border-status-danger/40',
  inverse: 'bg-white text-brand-700 shadow-medium hover:bg-brand-50 dark:hover:bg-white/90',
};

const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
  icon: 'h-9 w-9',
};

export const buttonStyles = ({ variant = 'primary', size = 'md', fullWidth = false } = {}) =>
  cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], fullWidth && 'w-full');

export const inputStyles = ({ invalid = false } = {}) =>
  cn(
    'w-full rounded-lg border bg-surface-primary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary shadow-soft transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
    invalid
      ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/15'
      : 'border-border-default hover:border-border-strong focus:border-brand-500 focus:ring-brand-500/15'
  );

export const TONE_STYLES = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-500/20 dark:text-brand-300',
  info: 'bg-status-info-bg text-status-info-fg ring-status-info/20',
  success: 'bg-status-success-bg text-status-success-fg ring-status-success/20',
  warning: 'bg-status-warning-bg text-status-warning-fg ring-status-warning/25',
  danger: 'bg-status-danger-bg text-status-danger-fg ring-status-danger/20',
  neutral: 'bg-status-neutral-bg text-status-neutral-fg ring-status-neutral/20',
};
