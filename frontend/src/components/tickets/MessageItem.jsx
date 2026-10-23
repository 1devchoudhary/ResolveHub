import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { AttachmentTile } from './AttachmentTile';
import { cn } from '../../utilities/cn';
import { formatRelative, formatDateTime } from '../../utilities/format';

// One message in the ticket conversation. Agent replies get a brand tint.
export const MessageItem = ({ author, body, createdAt, attachments = [], isOwn = false, label }) => {
  const isAgent = author?.role === 'agent' || author?.role === 'admin';

  return (
    <article className="flex gap-3 sm:gap-4">
      <Avatar name={author?.name} size="md" className="hidden sm:inline-flex" />
      <div className="min-w-0 flex-1">
        <header className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Avatar name={author?.name} size="xs" className="sm:hidden" />
          <span className="text-sm font-semibold text-text-primary">{isOwn ? 'You' : author?.name}</span>
          {isAgent && <Badge tone="brand">Support</Badge>}
          {label && <Badge tone="neutral">{label}</Badge>}
          <time className="text-xs text-text-tertiary" dateTime={createdAt} title={formatDateTime(createdAt)}>
            {formatRelative(createdAt)}
          </time>
        </header>

        <div
          className={cn(
            'rounded-xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed text-text-primary whitespace-pre-line',
            isAgent ? 'border-brand-200 bg-brand-50' : 'border-border-default bg-surface-primary shadow-soft'
          )}
        >
          {body}
        </div>

        {attachments.length > 0 && (
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {attachments.map((file) => (
              <AttachmentTile key={file.name} name={file.name} size={file.size} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
