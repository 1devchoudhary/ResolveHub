import { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, BellRing, UserRound } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Label, Input, FieldHint, FieldError, PasswordInput, Switch } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Avatar } from '../components/ui/Avatar';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/authContext';
import { authApi } from '../api/auth';
import { formatDate } from '../utilities/format';
import {
  normalizeMobile,
  validateMobile,
  validateName,
  validatePassword,
} from '../utilities/validation';

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

const CardFooter = ({ children, className = 'justify-end' }) => (
  <div
    className={`flex items-center gap-3 rounded-b-xl border-t border-border-default bg-surface-secondary px-5 py-3.5 sm:px-6 ${className}`}
  >
    {children}
  </div>
);

const ProfileForm = ({ user, setUser }) => {
  const [name, setName] = useState(user.name);
  const [mobile, setMobile] = useState(user.mobile);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const dirty = name.trim() !== user.name || normalizeMobile(mobile) !== user.mobile;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    const nameError = validateName(name);
    if (nameError) nextErrors.name = nameError;
    const mobileError = validateMobile(mobile);
    if (mobileError) nextErrors.mobile = mobileError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const { user: updated } = await authApi.updateProfile({
        name: name.trim(),
        mobile: normalizeMobile(mobile),
      });
      setUser(updated);
      setMobile(updated.mobile);
      toast.success('Profile updated');
    } catch (err) {
      setErrors(err.errors);
      if (Object.keys(err.errors).length === 0) toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader icon={UserRound} title="Personal details" />
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={user.isDemo} className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="lg" />
            <div>
              <p className="text-sm font-semibold text-text-primary">{user.name}</p>
              <p className="text-xs capitalize text-text-tertiary">{user.role} account</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="settings-name">Full name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                invalid={Boolean(errors.name)}
              />
              <FieldError>{errors.name}</FieldError>
            </div>
            <div>
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" type="email" value={user.email} readOnly disabled />
              <FieldHint>Contact support to change your login email.</FieldHint>
            </div>
            <div>
              <Label htmlFor="settings-mobile">Mobile number</Label>
              <Input
                id="settings-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                autoComplete="tel"
                invalid={Boolean(errors.mobile)}
              />
              <FieldError>{errors.mobile}</FieldError>
            </div>
          </div>
        </fieldset>
        <CardFooter className="justify-between">
          <p className="text-xs text-text-tertiary">Member since {formatDate(user.createdAt)}</p>
          <Button type="submit" disabled={user.isDemo || !dirty || saving}>
            {saving && <Spinner />} Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

const PasswordForm = ({ user }) => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.current) nextErrors.currentPassword = 'Enter your current password';
    const strength = validatePassword(form.next);
    if (strength) nextErrors.newPassword = strength;
    if (form.confirm !== form.next) nextErrors.confirm = 'Passwords do not match';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const { message } = await authApi.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
      });
      setForm({ current: '', next: '', confirm: '' });
      toast.success(message);
    } catch (err) {
      setErrors(err.errors);
      if (Object.keys(err.errors).length === 0) toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader icon={KeyRound} title="Change password" />
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={user.isDemo} className="space-y-5 p-5 sm:p-6">
          <div>
            <Label htmlFor="current-password">Current password</Label>
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              value={form.current}
              onChange={set('current')}
              show={show}
              onToggle={() => setShow(!show)}
              invalid={Boolean(errors.currentPassword)}
            />
            <FieldError>{errors.currentPassword}</FieldError>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                value={form.next}
                onChange={set('next')}
                show={show}
                onToggle={() => setShow(!show)}
                invalid={Boolean(errors.newPassword)}
              />
              {errors.newPassword ? (
                <FieldError>{errors.newPassword}</FieldError>
              ) : (
                <FieldHint>8+ characters, upper & lowercase.</FieldHint>
              )}
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={set('confirm')}
                show={show}
                onToggle={() => setShow(!show)}
                invalid={Boolean(errors.confirm)}
              />
              <FieldError>{errors.confirm}</FieldError>
            </div>
          </div>
        </fieldset>
        <CardFooter className="justify-between">
          <p className="text-xs text-text-tertiary">Other devices will be signed out.</p>
          <Button type="submit" disabled={user.isDemo || saving}>
            {saving && <Spinner />} Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

const NotificationsCard = ({ user, setUser }) => {
  const [saving, setSaving] = useState(false);

  // Saves as soon as it's toggled, with a rollback if the request fails
  const toggle = async (e) => {
    const emailNotifications = e.target.checked;
    setUser({ ...user, emailNotifications });
    setSaving(true);
    try {
      const { user: updated } = await authApi.updateProfile({ emailNotifications });
      setUser(updated);
      toast.success(emailNotifications ? 'Email notifications on' : 'Email notifications off');
    } catch (err) {
      setUser({ ...user, emailNotifications: !emailNotifications });
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader icon={BellRing} title="Email notifications" />
      <label
        htmlFor="notify-email"
        className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 sm:px-6"
      >
        <span>
          <span className="block text-sm font-medium text-text-primary">Ticket updates</span>
          <span className="block text-sm text-text-secondary">
            {user.role === 'customer'
              ? 'Email me when an agent replies, or my ticket is resolved.'
              : 'Email me when a ticket is assigned to me, or a customer replies.'}
          </span>
        </span>
        <Switch
          id="notify-email"
          checked={user.emailNotifications}
          onChange={toggle}
          disabled={saving}
        />
      </label>
    </Card>
  );
};

// Shared by all three portals
export const Settings = () => {
  const { user, setUser } = useAuth();

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, security and notifications." />

      {user.isDemo && (
        <Alert tone="info" className="mb-8">
          You’re using a shared demo account, so the profile and password are locked. Sign up with
          your own email to try editing them.
        </Alert>
      )}

      <Section
        title="Profile"
        description={
          user.role === 'customer'
            ? 'This information is shown to support agents on your tickets.'
            : 'Your name is shown to customers on your replies.'
        }
      >
        <ProfileForm user={user} setUser={setUser} />
      </Section>

      <Section title="Password" description="Use a strong password you don’t use anywhere else.">
        <PasswordForm user={user} />
      </Section>

      <Section title="Notifications" description="Choose what we email you about.">
        <NotificationsCard user={user} setUser={setUser} />
      </Section>
    </>
  );
};
