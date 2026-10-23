import { cn } from '../../utilities/cn';

// Eyebrow + title + description block used across marketing pages
export const SectionHeading = ({ eyebrow, title, description, align = 'center', as: Heading = 'h2', className }) => (
  <div className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}>
    {eyebrow && (
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
        {eyebrow}
      </p>
    )}
    <Heading className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl text-balance">
      {title}
    </Heading>
    {description && (
      <p className={cn('mt-4 text-base leading-relaxed text-text-secondary text-pretty', align === 'center' && 'mx-auto max-w-xl')}>
        {description}
      </p>
    )}
  </div>
);

// Pill label shown above page heroes ("ABOUT US", "CONTACT")
export const Eyebrow = ({ children, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300',
      className
    )}
  >
    {children}
  </span>
);
