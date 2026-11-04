import { cn } from '../../utilities/cn';

const PALETTE = [
  'bg-brand-100 text-brand-700 dark:text-brand-300',
  'bg-status-success-bg text-status-success-fg',
  'bg-status-warning-bg text-status-warning-fg',
  'bg-status-info-bg text-status-info-fg',
  'bg-status-danger-bg text-status-danger-fg',
];

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
};

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

// Same name -> same colour, every time
const colorFor = (name = '') => {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
};

export const Avatar = ({ name, src, size = 'sm', className, ring = false }) => (
  <span
    className={cn(
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold tracking-wide select-none',
      SIZES[size],
      !src && colorFor(name),
      ring && 'ring-2 ring-surface-primary',
      className,
    )}
    title={name}
  >
    {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initialsOf(name)}
  </span>
);
