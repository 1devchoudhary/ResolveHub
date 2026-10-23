import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CloudUpload,
  Send,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Flame,
  ListChecks,
  Clock3,
  LifeBuoy,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Label, Input, Select, Textarea, FieldHint } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { buttonStyles } from '../../components/ui/styles';
import { categories } from '../../mocks/customerData';

const priorityOptions = [
  { value: 'low', label: 'Low', hint: 'General question', icon: SignalLow, color: 'text-text-tertiary' },
  { value: 'medium', label: 'Medium', hint: 'Something isn’t working right', icon: SignalMedium, color: 'text-status-info' },
  { value: 'high', label: 'High', hint: 'A key feature is blocked', icon: SignalHigh, color: 'text-status-warning' },
  { value: 'urgent', label: 'Urgent', hint: 'Business-critical outage', icon: Flame, color: 'text-status-danger' },
];

const responseTimes = [
  { label: 'Urgent', time: '< 1 hour', dot: 'bg-status-danger' },
  { label: 'High', time: '< 4 hours', dot: 'bg-status-warning' },
  { label: 'Medium', time: '< 1 day', dot: 'bg-status-info' },
  { label: 'Low', time: '< 3 days', dot: 'bg-status-neutral' },
];

const tips = [
  'One issue per ticket — it gets routed faster.',
  'Include steps to reproduce and what you expected.',
  'Attach screenshots or error messages.',
  'Mention your browser / device if it’s a technical issue.',
];

export const NewTicket = () => (
  <>
    <Link
      to="/app/tickets"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
    >
      <ArrowLeft className="h-4 w-4" /> Back to tickets
    </Link>

    <PageHeader
      title="Create a new ticket"
      description="Tell us what’s going on and we’ll match you with the right expert."
    />

    <div className="grid gap-6 lg:grid-cols-3">
      {/* TODO: wire up submit, controlled inputs, validation and file upload */}
      <form className="lg:col-span-2" id="new-ticket-form" onSubmit={(e) => e.preventDefault()}>
        <Card>
          <div className="space-y-6 p-5 sm:p-6">
            {/* Subject */}
            <div>
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input id="ticket-subject" name="subject" placeholder="e.g. Payment failed but amount was debited" maxLength={120} />
              <FieldHint>A short summary helps us route your ticket to the right team.</FieldHint>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="ticket-category">Category</Label>
              <Select id="ticket-category" name="category" defaultValue="">
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>

            {/* Priority — radio cards, styled purely with CSS :checked */}
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-text-primary">How urgent is it?</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {priorityOptions.map((option) => (
                  <label
                    key={option.value}
                    className="relative flex cursor-pointer flex-col gap-1 rounded-xl border border-border-default bg-surface-primary p-3.5 shadow-soft transition-all hover:border-border-strong has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:ring-4 has-[:checked]:ring-brand-500/10 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/25"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      defaultChecked={option.value === 'medium'}
                      className="sr-only"
                    />
                    <option.icon className={`h-5 w-5 ${option.color}`} strokeWidth={2.25} />
                    <span className="mt-1 text-sm font-semibold text-text-primary">{option.label}</span>
                    <span className="text-xs leading-snug text-text-tertiary">{option.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Description */}
            <div>
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                name="description"
                rows={7}
                maxLength={2000}
                placeholder={'What happened?\nWhat did you expect to happen?\nSteps to reproduce…'}
              />
              <div className="mt-1.5 flex justify-between text-xs text-text-tertiary">
                <span>Be as specific as you can — it saves a round-trip.</span>
                <span className="font-mono">0 / 2000</span>
              </div>
            </div>

            {/* Attachments dropzone */}
            <div>
              <Label htmlFor="ticket-attachments" optional>
                Attachments
              </Label>
              <label
                htmlFor="ticket-attachments"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-strong bg-surface-secondary px-6 py-9 text-center transition-colors hover:border-brand-400 hover:bg-brand-50 has-[:focus-visible]:border-brand-500"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-primary text-brand-600 shadow-medium transition-transform group-hover:-translate-y-0.5 dark:text-brand-300">
                  <CloudUpload className="h-5 w-5" />
                </span>
                <span className="mt-3 text-sm text-text-secondary">
                  <span className="font-semibold text-brand-600 dark:text-brand-400">Click to upload</span> or drag and drop
                </span>
                <span className="mt-1 text-xs text-text-tertiary">PNG, JPG or GIF · up to 5 MB each · max 5 files</span>
                <input id="ticket-attachments" name="attachments" type="file" accept="image/*" multiple className="sr-only" />
              </label>
              {/* Selected files: map over them with <AttachmentTile name size onRemove /> from components/tickets */}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border-default bg-surface-secondary px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 rounded-b-xl">
            <p className="text-xs text-text-tertiary">You’ll get an email when an agent picks this up.</p>
            <div className="flex gap-2">
              <Link to="/app/tickets" className={buttonStyles({ variant: 'secondary' })}>
                Cancel
              </Link>
              <Button type="submit" id="btn-submit-ticket">
                <Send className="h-4 w-4" /> Submit ticket
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Side panel */}
      <aside className="space-y-6">
        <Card>
          <CardHeader icon={ListChecks} title="Before you submit" />
          <ul className="space-y-3 p-5">
            {tips.map((tip, i) => (
              <li key={tip} className="flex gap-3 text-sm text-text-secondary">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-600 dark:text-brand-300">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader icon={Clock3} title="Target first response" description="By priority, during business hours" />
          <dl className="divide-y divide-border-default">
            {responseTimes.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3 text-sm">
                <dt className="flex items-center gap-2 text-text-secondary">
                  <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                  {row.label}
                </dt>
                <dd className="font-semibold text-text-primary">{row.time}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="flex items-start gap-3 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-danger-bg text-status-danger-fg">
            <LifeBuoy className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-text-primary">Service completely down?</p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Call our 24/7 line at <span className="font-semibold text-text-primary">+1 (555) 123-4567</span>.
            </p>
          </div>
        </Card>
      </aside>
    </div>
  </>
);
