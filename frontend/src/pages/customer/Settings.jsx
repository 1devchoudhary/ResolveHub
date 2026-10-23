import { Camera, KeyRound, BellRing, UserRound, TriangleAlert } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Label, Input, FieldHint, Switch } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate } from '../../utilities/format';
// TODO: replace with the logged-in user from your auth context / API
import { currentUser } from '../../mocks/customerData';

const notificationPrefs = [
  { id: 'notify-replies', label: 'Agent replies', hint: 'Email me when an agent responds to my ticket.', defaultChecked: true },
  { id: 'notify-status', label: 'Status changes', hint: 'When a ticket is assigned, resolved or closed.', defaultChecked: true },
  { id: 'notify-digest', label: 'Weekly summary', hint: 'A Monday digest of all open tickets.', defaultChecked: false },
];

// Two-column settings section: description on the left, card on the right
const Section = ({ title, description, children }) => (
  <section className="grid gap-6 border-b border-border-default py-8 first:pt-0 last:border-b-0 lg:grid-cols-3">
    <div>
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    </div>
    <div className="lg:col-span-2">{children}</div>
  </section>
);

export const Settings = () => (
  <>
    <PageHeader title="Settings" description="Manage your profile, security and notifications." />

    <Section title="Profile" description="This information is shown to support agents on your tickets.">
      {/* TODO: wire up profile update */}
      <Card>
        <CardHeader icon={UserRound} title="Personal details" />
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <Avatar name={currentUser.name} size="lg" />
              <div>
                <Button variant="secondary" size="sm">
                  <Camera className="h-3.5 w-3.5" /> Change photo
                </Button>
                <p className="mt-1.5 text-xs text-text-tertiary">JPG or PNG, max 2 MB.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="settings-name">Full name</Label>
                <Input id="settings-name" name="name" defaultValue={currentUser.name} autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="settings-email">Email</Label>
                <Input id="settings-email" name="email" type="email" defaultValue={currentUser.email} autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="settings-phone">Phone</Label>
                <Input id="settings-phone" name="mobile" type="tel" defaultValue={currentUser.phone} autoComplete="tel" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border-default bg-surface-secondary px-5 py-3.5 sm:px-6 rounded-b-xl">
            <p className="text-xs text-text-tertiary">Member since {formatDate(currentUser.createdAt)}</p>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>
    </Section>

    <Section title="Password" description="Use a strong password you don’t use anywhere else.">
      {/* TODO: wire up password change */}
      <Card>
        <CardHeader icon={KeyRound} title="Change password" />
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" autoComplete="current-password" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" autoComplete="new-password" />
                <FieldHint>8+ characters, upper & lowercase.</FieldHint>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" />
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t border-border-default bg-surface-secondary px-5 py-3.5 sm:px-6 rounded-b-xl">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </Card>
    </Section>

    <Section title="Notifications" description="Choose what we email you about.">
      <Card>
        <CardHeader icon={BellRing} title="Email notifications" />
        <ul className="divide-y divide-border-default">
          {notificationPrefs.map((pref) => (
            <li key={pref.id}>
              <label htmlFor={pref.id} className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 sm:px-6">
                <span>
                  <span className="block text-sm font-medium text-text-primary">{pref.label}</span>
                  <span className="block text-sm text-text-secondary">{pref.hint}</span>
                </span>
                <Switch id={pref.id} defaultChecked={pref.defaultChecked} />
              </label>
            </li>
          ))}
        </ul>
      </Card>
    </Section>

    <Section title="Danger zone" description="Irreversible actions for your account.">
      <Card className="border-status-danger/30">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-danger-bg text-status-danger-fg">
              <TriangleAlert className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Delete account</p>
              <p className="text-sm text-text-secondary">Permanently remove your account and all ticket history.</p>
            </div>
          </div>
          <Button variant="danger">Delete account</Button>
        </div>
      </Card>
    </Section>
  </>
);
