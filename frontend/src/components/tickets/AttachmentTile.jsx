import { Download, FileText, ImageIcon } from 'lucide-react';
import { cn } from '../../utilities/cn';

const isImage = (name = '') => /\.(png|jpe?g|gif|webp|svg)$/i.test(name);

// File chip used in the thread, the details panel and the upload preview
export const AttachmentTile = ({ name, size, className, onRemove }) => {
  const Icon = isImage(name) ? ImageIcon : FileText;

  return (
    <div
      className={cn(
        'group flex w-full max-w-xs items-center gap-3 rounded-lg border border-border-default bg-surface-primary p-2 pr-3 shadow-soft hover:border-border-strong transition-colors',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
          isImage(name)
            ? 'bg-linear-to-br from-brand-100 to-brand-200 text-brand-700 dark:text-brand-300'
            : 'bg-surface-tertiary text-text-secondary',
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-text-primary">{name}</p>
        {size && <p className="text-[11px] text-text-tertiary">{size}</p>}
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-medium text-text-tertiary hover:text-status-danger cursor-pointer"
        >
          Remove
        </button>
      ) : (
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary transition-colors cursor-pointer"
          aria-label={`Download ${name}`}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
