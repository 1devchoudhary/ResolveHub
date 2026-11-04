import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Pencil, Plus, Tags, X } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, FieldError, Switch } from '../../components/ui/Field';
import { Skeleton } from '../../components/ui/Skeleton';
import { Spinner } from '../../components/ui/Spinner';
import { useCategories } from '../../hooks/queries/useTickets';
import { useCreateCategory, useUpdateCategory } from '../../hooks/queries/useAdmin';
import { cn } from '../../utilities/cn';

const CategoryRow = ({ category }) => {
  const update = useUpdateCategory();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState('');

  const save = (e) => {
    e.preventDefault();
    setError('');
    update.mutate(
      { id: category.id, name: name.trim() },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success('Category renamed');
        },
        onError: (err) => setError(err.errors.name ?? err.message),
      },
    );
  };

  return (
    <li className={cn('flex items-center gap-4 px-5 py-3.5', !category.isActive && 'opacity-60')}>
      <div className="min-w-0 flex-1">
        {editing ? (
          <form onSubmit={save} className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Category name"
                autoFocus
                invalid={Boolean(error)}
              />
              <FieldError>{error}</FieldError>
            </div>
            <Button type="submit" size="icon" aria-label="Save" disabled={update.isPending}>
              {update.isPending ? <Spinner /> : <Check className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cancel"
              onClick={() => {
                setEditing(false);
                setName(category.name);
                setError('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary">{category.name}</span>
            {!category.isActive && <Badge tone="neutral">Retired</Badge>}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="cursor-pointer rounded p-1 text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary"
              aria-label={`Rename ${category.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <span className="text-sm tabular-nums text-text-tertiary">
        {category.ticketCount} tickets
      </span>
      <label className="flex items-center gap-2 text-xs text-text-secondary">
        <Switch
          checked={category.isActive}
          disabled={update.isPending}
          onChange={(e) =>
            update.mutate(
              { id: category.id, isActive: e.target.checked },
              {
                onSuccess: () =>
                  toast.success(e.target.checked ? 'Category enabled' : 'Category retired'),
                onError: (err) => toast.error(err.message),
              },
            )
          }
        />
        <span className="sr-only">Available for new tickets</span>
      </label>
    </li>
  );
};

export const Categories = () => {
  const { data: categories, isPending } = useCategories();
  const create = useCreateCategory();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const add = (e) => {
    e.preventDefault();
    setError('');
    create.mutate(
      { name: name.trim() },
      {
        onSuccess: (category) => {
          setName('');
          toast.success(`“${category.name}” added`);
        },
        onError: (err) => setError(err.errors.name ?? err.message),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="What customers choose from when they open a ticket."
      />

      <Card>
        <CardHeader
          icon={Tags}
          title="Ticket categories"
          description="Retire a category to hide it from new tickets. Existing tickets keep it."
        />
        <form onSubmit={add} className="flex items-start gap-2 border-b border-border-default p-5">
          <div className="flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New category, e.g. Shipping & delivery"
              aria-label="New category name"
              maxLength={60}
              invalid={Boolean(error)}
            />
            <FieldError>{error}</FieldError>
          </div>
          <Button type="submit" disabled={create.isPending || !name.trim()}>
            {create.isPending ? <Spinner /> : <Plus className="h-4 w-4" />} Add
          </Button>
        </form>
        {isPending ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border-default">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
};
