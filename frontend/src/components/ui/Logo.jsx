import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { cn } from '../../utilities/cn';

const SIZES = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4', text: 'text-lg' },
  md: { box: 'h-9 w-9 rounded-lg', icon: 'h-5 w-5', text: 'text-xl' },
  lg: { box: 'h-10 w-10 rounded-xl', icon: 'h-5 w-5', text: 'text-2xl' },
};

export const LogoMark = ({ size = 'md', className }) => (
  <span
    className={cn(
      'relative flex items-center justify-center bg-linear-to-br from-brand-500 to-brand-700 shadow-soft ring-1 ring-inset ring-white/15',
      SIZES[size].box,
      className,
    )}
  >
    <MessageSquare className={cn('text-white', SIZES[size].icon)} strokeWidth={2.5} />
  </span>
);

export const Logo = ({ to = '/', size = 'md', className, id }) => (
  <Link to={to} className={cn('inline-flex items-center gap-2.5 group', className)} id={id}>
    <LogoMark size={size} className="group-hover:shadow-glow transition-shadow duration-200" />
    <span className={cn('font-bold tracking-tight text-text-primary', SIZES[size].text)}>
      Resolve<span className="text-brand-600 dark:text-brand-400">Hub</span>
    </span>
  </Link>
);
