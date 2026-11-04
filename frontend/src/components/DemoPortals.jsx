import { Link } from 'react-router-dom';
import { ArrowRight, Check, Headset, ShieldCheck, UserRound } from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';
import { DEMO_PASSWORD } from '../utilities/portals';

const PORTALS = [
  {
    to: '/login',
    icon: UserRound,
    title: 'Customer portal',
    who: 'For people who need help',
    features: ['Open and track tickets', 'Reply to agents', 'Close or reopen resolved tickets'],
  },
  {
    to: '/agent/login',
    icon: Headset,
    title: 'Agent workspace',
    who: 'For the support team',
    features: [
      'Personal queue with auto-assignment',
      'Internal notes',
      'Status, priority and reassignment',
    ],
  },
  {
    to: '/admin/login',
    icon: ShieldCheck,
    title: 'Admin console',
    who: 'For support leads',
    features: [
      'Volume and response-time analytics',
      'Team and role management',
      'Ticket categories',
    ],
  },
];

// Landing-page section that sends visitors straight into each portal's one-click demo
export const DemoPortals = () => (
  <section
    className="bg-surface-secondary py-16 lg:py-20 border-y border-border-default"
    id="live-demo"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Live demo"
        title="Try all three portals"
        description={`Each login page has a one-click demo account (password ${DEMO_PASSWORD}). Demo data resets every night.`}
        className="mb-12"
      />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        {PORTALS.map((portal) => (
          <Link
            key={portal.to}
            to={portal.to}
            className="group flex flex-col rounded-2xl border border-border-default bg-surface-primary p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-medium"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:text-brand-300">
                <portal.icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-text-tertiary transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-600" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">{portal.title}</h3>
            <p className="mt-0.5 text-sm text-text-tertiary">{portal.who}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {portal.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                  {feature}
                </li>
              ))}
            </ul>
            <span className="mt-5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              Open the demo →
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
