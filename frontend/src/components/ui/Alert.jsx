import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from '../../utilities/cn';
import { TONE_STYLES } from './styles';

const ICONS = { danger: CircleAlert, success: CircleCheck, info: Info, warning: CircleAlert };

// Form-level message, e.g. "Invalid email or password"
export const Alert = ({ tone = 'danger', children, className }) => {
  if (!children) return null;
  const Icon = ICONS[tone] ?? Info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm ring-1 ring-inset animate-slide-down',
        TONE_STYLES[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};
