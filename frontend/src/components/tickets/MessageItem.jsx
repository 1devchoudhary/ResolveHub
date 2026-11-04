import { Lock } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { cn } from '../../utilities/cn';
import { formatRelative, formatDateTime } from '../../utilities/format';

// One message in the ticket conversation. Support replies get a brand tint; internal notes
// (staff only) are amber so nobody mistakes them for something the customer can see.
export const MessageItem = ({
  author,
  body,
  createdAt,
  isOwn = false,
  isInternal = false,
  label,
}) => {
  const isSupport = author?.role === 'agent' || author?.role === 'admin';

  return (
    <article className="flex gap-3 sm:gap-4">
      <Avatar name={author?.name} size="md" className="hidden sm:inline-flex" />
      <div className="min-w-0 flex-1">
        <header className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Avatar name={author?.name} size="xs" className="sm:hidden" />
          <span className="text-sm font-semibold text-text-primary">
            {isOwn ? 'You' : author?.name}
          </span>
          {isSupport && !isInternal && <Badge tone="brand">Support</Badge>}
          {isInternal && (
            <Badge tone="warning">
              <Lock className="h-3 w-3" /> Internal note
            </Badge>
          )}
          {label && <Badge tone="neutral">{label}</Badge>}
          <time
            className="text-xs text-text-tertiary"
            dateTime={createdAt}
            title={formatDateTime(createdAt)}
          >
            {formatRelative(createdAt)}
          </time>
        </header>

        <div
          className={cn(
            'whitespace-pre-line rounded-xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed text-text-primary',
            isInternal
              ? 'border-dashed border-status-warning/40 bg-status-warning-bg'
              : isSupport
                ? 'border-brand-200 bg-brand-50'
                : 'border-border-default bg-surface-primary shadow-soft',
          )}
        >
          {body}
        </div>
      </div>
    </article>
  );
};
