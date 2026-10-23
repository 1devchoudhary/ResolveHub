import { ChevronDown, Eye, EyeOff, CircleAlert } from 'lucide-react';
import { cn } from '../../utilities/cn';
import { inputStyles } from './styles';

// Presentational form controls. Every prop (value, onChange, id, name, required…)
// is passed straight through, so your own state/validation plugs in unchanged.

export const Label = ({ className, children, optional, ...props }) => (
  <label className={cn('mb-1.5 block text-sm font-medium text-text-primary', className)} {...props}>
    {children}
    {optional && <span className="ml-1.5 text-xs font-normal text-text-tertiary">Optional</span>}
  </label>
);

export const Input = ({ className, invalid, icon: Icon, ...props }) => {
  if (!Icon) {
    return <input className={cn(inputStyles({ invalid }), className)} aria-invalid={invalid || undefined} {...props} />;
  }
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      <input
        className={cn(inputStyles({ invalid }), 'pl-10', className)}
        aria-invalid={invalid || undefined}
        {...props}
      />
    </div>
  );
};

export const Textarea = ({ className, invalid, ...props }) => (
  <textarea
    className={cn(inputStyles({ invalid }), 'resize-y min-h-28 leading-relaxed', className)}
    aria-invalid={invalid || undefined}
    {...props}
  />
);

export const Select = ({ className, invalid, children, ...props }) => (
  <div className="relative">
    <select
      className={cn(inputStyles({ invalid }), 'appearance-none pr-10 cursor-pointer', className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
  </div>
);

// Password field with show/hide button — `show` and `onToggle` come from your state.
export const PasswordInput = ({ show, onToggle, toggleId, className, invalid, ...props }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      className={cn(inputStyles({ invalid }), 'pr-10', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer"
      aria-label={show ? 'Hide password' : 'Show password'}
      id={toggleId}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
);

export const FieldError = ({ children, className, ...props }) => {
  if (!children) return null;
  return (
    <p
      className={cn('mt-1.5 flex items-center gap-1.5 text-xs font-medium text-status-danger animate-slide-down', className)}
      role="alert"
      {...props}
    >
      <CircleAlert className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
};

export const FieldHint = ({ children, className, ...props }) => (
  <p className={cn('mt-1.5 text-xs text-text-tertiary', className)} {...props}>
    {children}
  </p>
);

// Pure-CSS toggle switch (works with defaultChecked or checked/onChange)
export const Switch = ({ className, ...props }) => (
  <span className={cn('relative inline-flex shrink-0', className)}>
    <input type="checkbox" className="peer sr-only" {...props} />
    <span
      aria-hidden="true"
      className="h-6 w-11 rounded-full bg-border-strong transition-colors duration-200 peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-primary after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-medium after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
    />
  </span>
);
