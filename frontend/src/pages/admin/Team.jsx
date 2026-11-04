import { useState } from 'react';
import { toast } from 'sonner';
import { Search, UserPlus, X } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input, Label, FieldError, PasswordInput, Select } from '../../components/ui/Field';
import { Skeleton } from '../../components/ui/Skeleton';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/authContext';
import { useCreateStaff, useUpdateUser, useUsers } from '../../hooks/queries/useAdmin';
import { cn } from '../../utilities/cn';
import { formatRelative } from '../../utilities/format';
import { normalizeMobile } from '../../utilities/validation';

const ROLE_TABS = [
  { key: '', label: 'Everyone' },
  { key: 'agent', label: 'Agents' },
  { key: 'admin', label: 'Admins' },
  { key: 'customer', label: 'Customers' },
];

const ROLE_TONE = { admin: 'danger', agent: 'brand', customer: 'neutral' };
const PAGE_SIZE = 20;

const EMPTY_FORM = { name: '', email: '', mobile: '', password: '', role: 'agent' };

const AddStaffForm = ({ onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const createStaff = useCreateStaff();

  const set = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setErrors({});
    createStaff.mutate(
      { ...form, mobile: normalizeMobile(form.mobile) ?? form.mobile },
      {
        onSuccess: (user) => {
          toast.success(`${user.name} added`, {
            description: `They can sign in at /${user.role}/login with the password you set.`,
          });
          setForm(EMPTY_FORM);
          onClose();
        },
        onError: (err) => {
          setErrors(err.errors);
          if (Object.keys(err.errors).length === 0) toast.error(err.message);
        },
      },
    );
  };

  return (
    <Card className="mb-6 animate-slide-down">
      <CardHeader
        icon={UserPlus}
        title="Add a team member"
        description="Staff accounts can't sign up themselves: share the password with them securely."
        action={
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        }
      />
      <form onSubmit={submit} noValidate className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <Label htmlFor="staff-name">Full name</Label>
          <Input
            id="staff-name"
            value={form.name}
            onChange={set('name')}
            invalid={Boolean(errors.name)}
          />
          <FieldError>{errors.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="staff-email">Work email</Label>
          <Input
            id="staff-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            invalid={Boolean(errors.email)}
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="staff-mobile">Mobile number</Label>
          <Input
            id="staff-mobile"
            type="tel"
            value={form.mobile}
            onChange={set('mobile')}
            invalid={Boolean(errors.mobile)}
          />
          <FieldError>{errors.mobile}</FieldError>
        </div>
        <div>
          <Label htmlFor="staff-role">Role</Label>
          <Select id="staff-role" value={form.role} onChange={set('role')}>
            <option value="agent">Agent: works the ticket queue</option>
            <option value="admin">Admin: manages team and settings</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="staff-password">Temporary password</Label>
          <PasswordInput
            id="staff-password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            invalid={Boolean(errors.password)}
          />
          <FieldError>{errors.password}</FieldError>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createStaff.isPending}>
            {createStaff.isPending ? <Spinner /> : <UserPlus className="h-4 w-4" />} Add member
          </Button>
        </div>
      </form>
    </Card>
  );
};

const UserRow = ({ person, isSelf }) => {
  const updateUser = useUpdateUser();
  const locked = isSelf || person.isDemo;

  const change = (changes, message) =>
    updateUser.mutate(
      { id: person.id, ...changes },
      { onSuccess: () => toast.success(message), onError: (err) => toast.error(err.message) },
    );

  return (
    <tr className={cn(!person.isActive && 'opacity-60')}>
      <td className="px-5 py-3">
        <span className="flex items-center gap-3">
          <Avatar name={person.name} size="sm" />
          <span className="min-w-0">
            <span className="flex items-center gap-2 font-medium text-text-primary">
              {person.name}
              {isSelf && <Badge tone="neutral">You</Badge>}
              {person.isDemo && <Badge tone="info">Demo</Badge>}
            </span>
            <span className="block truncate text-xs text-text-tertiary">{person.email}</span>
          </span>
        </span>
      </td>
      <td className="px-5 py-3">
        {person.role === 'customer' || locked ? (
          <Badge tone={ROLE_TONE[person.role]} className="capitalize">
            {person.role}
          </Badge>
        ) : (
          <Select
            aria-label={`Role for ${person.name}`}
            value={person.role}
            disabled={updateUser.isPending}
            onChange={(e) =>
              change({ role: e.target.value }, `${person.name} is now an ${e.target.value}`)
            }
            className="h-8 w-28 py-1! text-xs"
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </Select>
        )}
      </td>
      <td className="hidden px-5 py-3 text-sm tabular-nums text-text-secondary md:table-cell">
        {person.role === 'customer'
          ? `${person.ticketsOpened} opened`
          : `${person.activeAssigned} active`}
      </td>
      <td className="hidden px-5 py-3 text-sm text-text-tertiary lg:table-cell">
        {person.lastLoginAt ? formatRelative(person.lastLoginAt) : 'Never'}
      </td>
      <td className="px-5 py-3 text-right">
        {locked ? (
          <span className="text-xs text-text-tertiary">{isSelf ? '—' : 'Protected'}</span>
        ) : (
          <Button
            variant={person.isActive ? 'danger' : 'secondary'}
            size="sm"
            disabled={updateUser.isPending}
            onClick={() =>
              change(
                { isActive: !person.isActive },
                person.isActive ? `${person.name} deactivated` : `${person.name} reactivated`,
              )
            }
          >
            {person.isActive ? 'Deactivate' : 'Reactivate'}
          </Button>
        )}
      </td>
    </tr>
  );
};

export const Team = () => {
  const { user } = useAuth();
  const [role, setRole] = useState('agent');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data, isPending } = useUsers({ role, q, page, limit: PAGE_SIZE });
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Team & users"
        description="Add agents and admins, change roles, or deactivate accounts."
        actions={
          !adding && (
            <Button onClick={() => setAdding(true)}>
              <UserPlus className="h-4 w-4" /> Add team member
            </Button>
          )
        }
      />

      {adding && <AddStaffForm onClose={() => setAdding(false)} />}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-default px-5 py-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg bg-surface-tertiary p-1">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key || 'all'}
                type="button"
                aria-pressed={role === tab.key}
                onClick={() => {
                  setRole(tab.key);
                  setPage(1);
                }}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  role === tab.key
                    ? 'bg-surface-primary text-text-primary shadow-soft'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <form
            className="sm:ml-auto sm:w-64"
            onSubmit={(e) => {
              e.preventDefault();
              setQ(search.trim());
              setPage(1);
            }}
          >
            <Input
              icon={Search}
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value) setQ('');
              }}
              placeholder="Search name or email…"
              aria-label="Search users"
            />
          </form>
        </div>

        {isPending ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="No users found" description="Try another filter or search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-secondary text-[11px] uppercase tracking-wider text-text-tertiary">
                <tr>
                  <th className="px-5 py-2.5 text-left font-semibold">Person</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Role</th>
                  <th className="hidden px-5 py-2.5 text-left font-semibold md:table-cell">
                    Tickets
                  </th>
                  <th className="hidden px-5 py-2.5 text-left font-semibold lg:table-cell">
                    Last login
                  </th>
                  <th className="px-5 py-2.5 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {data.items.map((person) => (
                  <UserRow key={person.id} person={person} isSelf={person.id === user.id} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border-default bg-surface-secondary px-5 py-3 text-xs text-text-tertiary">
          <span>{data ? `${data.total} people` : ''}</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
