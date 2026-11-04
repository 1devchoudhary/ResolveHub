import { Link } from 'react-router-dom';
import {
  Search,
  TicketPlus,
  ClipboardList,
  BookOpen,
  CreditCard,
  Rocket,
  AlertTriangle,
  Puzzle,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
  Clock,
  Star,
  Headphones,
  UserCheck,
  CircleCheckBig,
  MessagesSquare,
  Bell,
} from 'lucide-react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { DemoPortals } from '../components/DemoPortals';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { buttonStyles } from '../components/ui/styles';

const cardClasses =
  'group relative rounded-xl border border-border-default bg-surface-primary p-6 shadow-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-large transition-all duration-300';

const iconTileClasses =
  'flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:text-brand-300 group-hover:bg-brand-100 transition-colors duration-200';

// Static rows for the hero product preview
const previewTickets = [
  {
    id: 'RH-1048',
    subject: 'Payment failed but amount debited',
    status: 'in-progress',
    priority: 'urgent',
    agent: 'Priya Sharma',
  },
  {
    id: 'RH-1047',
    subject: 'Password reset link expired',
    status: 'pending',
    priority: 'high',
    agent: 'Marcus Lee',
  },
  {
    id: 'RH-1046',
    subject: 'CSV export missing columns',
    status: 'open',
    priority: 'medium',
    agent: null,
  },
  {
    id: 'RH-1042',
    subject: 'Webhook deliveries failing (401)',
    status: 'resolved',
    priority: 'high',
    agent: 'Priya Sharma',
  },
];

export const Home = () => {
  const quickActions = [
    {
      icon: TicketPlus,
      title: 'Submit a Ticket',
      description: 'Describe your issue and our team will get back to you fast.',
      to: '/login',
    },
    {
      icon: ClipboardList,
      title: 'Track a Ticket',
      description: 'Check the status of your existing support ticket anytime.',
      to: '/login',
    },
    {
      icon: BookOpen,
      title: 'Browse Help Articles',
      description: 'Find answers in our comprehensive knowledge base.',
      to: '/about',
    },
  ];

  const steps = [
    {
      icon: MessagesSquare,
      title: 'Describe the issue',
      description: 'Raise a ticket with details and screenshots in under a minute.',
    },
    {
      icon: UserCheck,
      title: 'Matched to an expert',
      description: 'Smart auto-assignment routes it to the right available agent instantly.',
    },
    {
      icon: Bell,
      title: 'Track every step',
      description: 'Follow live progress, reply in-thread and get notified when it’s resolved.',
    },
  ];

  const helpTopics = [
    {
      icon: CreditCard,
      title: 'Account & Billing',
      description: 'Manage your account, billing and subscriptions.',
    },
    {
      icon: Rocket,
      title: 'Getting Started',
      description: 'Learn the basics and get up and running.',
    },
    {
      icon: AlertTriangle,
      title: 'Troubleshooting',
      description: 'Fix common issues and errors.',
    },
    {
      icon: Puzzle,
      title: 'Integrations',
      description: 'Connect with your favorite tools and apps.',
    },
    {
      icon: ShieldCheck,
      title: 'Security',
      description: 'Learn about our security practices.',
    },
    {
      icon: Lightbulb,
      title: 'Feature Requests',
      description: 'Suggest new features and improvements.',
    },
  ];

  const stats = [
    { icon: Clock, value: '< 2 hrs', label: 'Average response time' },
    { icon: Star, value: '98%', label: 'Customer satisfaction' },
    { icon: Headphones, value: '24/7', label: 'Support availability' },
  ];

  return (
    <main>
      {/* ════════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-surface-primary" id="hero">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"></div>
          <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] bg-brand-200 rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-brand-100 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 lg:pt-28 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-primary/80 px-3 py-1 text-xs font-medium text-text-secondary shadow-soft backdrop-blur animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
                </span>
                Support team online · replies in under 2 hours
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.08] animate-fade-in stagger-1 text-balance">
                How can we help{' '}
                <span className="relative whitespace-nowrap">
                  <span className="bg-linear-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                    you today
                  </span>
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-3 text-brand-300 opacity-70"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 8 Q50 0 100 6 Q150 12 200 4"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                ?
              </h1>
              <p className="mt-5 text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 animate-fade-in stagger-2 text-pretty">
                Search our help center or submit a ticket — we’ll route it to the right expert and
                keep you updated at every step.
              </p>

              {/* Search Bar */}
              <div className="mt-8 max-w-xl mx-auto lg:mx-0 animate-fade-in stagger-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-500/15 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 h-5 w-5 text-text-tertiary pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search for answers..."
                      className="w-full rounded-xl border border-border-default bg-surface-primary pl-12 pr-20 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary shadow-medium focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 transition-all duration-200"
                      id="hero-search"
                    />
                    <kbd className="absolute right-3 hidden sm:inline-flex items-center rounded-md border border-border-default bg-surface-secondary px-2 py-0.5 font-mono text-[11px] text-text-tertiary">
                      ⌘ K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 animate-fade-in stagger-4">
                <Link to="/login" className={buttonStyles({ size: 'lg' })} id="hero-submit-ticket">
                  <TicketPlus className="h-4 w-4" />
                  Submit a Ticket
                </Link>
                <Link
                  to="/login"
                  className={buttonStyles({ variant: 'secondary', size: 'lg' })}
                  id="hero-track-ticket"
                >
                  <ClipboardList className="h-4 w-4" />
                  Track Your Ticket
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-3 animate-fade-in stagger-5">
                <div className="flex -space-x-2">
                  {['Jane Cooper', 'Leo Martins', 'Sara Ito', 'Omar Haddad'].map((name) => (
                    <Avatar key={name} name={name} size="sm" ring />
                  ))}
                </div>
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">2,000+</span> customers helped
                  this month
                </p>
              </div>
            </div>

            {/* Product preview */}
            <div className="relative mx-auto w-full max-w-xl animate-fade-in stagger-3">
              <div
                className="absolute -inset-4 rounded-3xl bg-linear-to-tr from-brand-500/20 via-brand-300/10 to-transparent blur-2xl"
                aria-hidden="true"
              ></div>

              <div className="relative overflow-hidden rounded-2xl border border-border-default bg-surface-primary shadow-float">
                {/* Window chrome */}
                <div className="flex items-center gap-2 border-b border-border-default bg-surface-secondary px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-status-danger/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-status-warning/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-status-success/70"></span>
                  <span className="ml-3 flex-1 truncate rounded-md border border-border-default bg-surface-primary px-3 py-1 font-mono text-[11px] text-text-tertiary">
                    resolvehub.app/app/tickets
                  </span>
                </div>

                {/* Mini inbox */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">My tickets</p>
                    <p className="text-xs text-text-tertiary">4 active · updated just now</p>
                  </div>
                  <span className={buttonStyles({ size: 'sm' })}>
                    <TicketPlus className="h-3.5 w-3.5" /> New
                  </span>
                </div>
                <ul className="divide-y divide-border-default border-t border-border-default">
                  {previewTickets.map((ticket) => (
                    <li key={ticket.id} className="flex items-center gap-3 px-5 py-3">
                      <PriorityBadge priority={ticket.priority} showLabel={false} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {ticket.subject}
                        </p>
                        <p className="font-mono text-[11px] text-text-tertiary">{ticket.id}</p>
                      </div>
                      <StatusBadge status={ticket.status} className="hidden sm:inline-flex" />
                      {ticket.agent ? (
                        <Avatar name={ticket.agent} size="xs" />
                      ) : (
                        <span
                          className="h-6 w-6 rounded-full border border-dashed border-border-strong"
                          title="Unassigned"
                        ></span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Floating: agent reply */}
              <div className="absolute -bottom-10 -left-4 sm:-left-10 w-64 rounded-xl border border-border-default bg-surface-elevated p-3.5 shadow-float animate-float-slow">
                <div className="flex items-center gap-2">
                  <Avatar name="Priya Sharma" size="xs" />
                  <p className="text-xs font-semibold text-text-primary">Priya · Support</p>
                  <span className="ml-auto text-[10px] text-text-tertiary">2m</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  Found it — the refund is on its way. You’ll see it in 3–5 days. 🙌
                </p>
              </div>

              {/* Floating: resolved toast */}
              <div
                className="absolute -top-6 -right-2 sm:-right-6 flex items-center gap-2 rounded-xl border border-border-default bg-surface-elevated px-3.5 py-2.5 shadow-float animate-float"
                style={{ animationDelay: '1s' }}
              >
                <CircleCheckBig className="h-4 w-4 text-status-success" />
                <p className="text-xs font-semibold text-text-primary">RH-1042 resolved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DemoPortals />

      {/* ════════════════════════════════════════════════
          QUICK ACTIONS
         ════════════════════════════════════════════════ */}
      <section className="bg-surface-primary py-16 lg:py-24" id="quick-actions">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Quick Actions"
            title="Get the help you need, faster"
            description="Choose an option below to find the right support."
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {quickActions.map((action, i) => (
              <Link
                key={action.title}
                to={action.to}
                className={`${cardClasses} animate-fade-in stagger-${i + 1}`}
                id={`quick-action-${i}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={iconTileClasses}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-brand-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1.5">{action.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          HOW IT WORKS
         ════════════════════════════════════════════════ */}
      <section
        className="relative bg-surface-secondary py-16 lg:py-24 border-y border-border-default"
        id="how-it-works"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="From problem to resolved in three steps"
            description="No phone queues, no lost emails. Every request is tracked from the moment you hit submit."
            className="mb-14"
          />

          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8 max-w-5xl mx-auto">
            {/* connecting line */}
            <div
              className="absolute left-[16.5%] right-[16.5%] top-7 hidden h-px bg-linear-to-r from-transparent via-border-strong to-transparent md:block"
              aria-hidden="true"
            ></div>
            {steps.map((step, i) => (
              <li key={step.title} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border-default bg-surface-primary text-brand-600 shadow-medium dark:text-brand-300">
                  <step.icon className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white ring-4 ring-surface-secondary">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          POPULAR TOPICS
         ════════════════════════════════════════════════ */}
      <section className="bg-surface-primary py-16 lg:py-24" id="popular-topics">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Popular Topics"
            title="Find answers to common questions"
            description="Explore our most popular help topics."
            className="mb-12"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {helpTopics.map((topic, i) => (
              <div
                key={topic.title}
                className={`${cardClasses} cursor-pointer animate-fade-in stagger-${i + 1}`}
                id={`topic-${i}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={iconTileClasses}>
                    <topic.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-brand-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1.5">{topic.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SYSTEM STATUS + STATS
         ════════════════════════════════════════════════ */}
      <section
        className="bg-surface-secondary border-t border-border-default py-16 lg:py-20"
        id="stats"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* System Status Banner */}
          <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border-default bg-surface-primary px-6 py-4 shadow-soft max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">All systems operational</p>
                <p className="text-xs text-text-secondary">Our services are running smoothly.</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
              id="view-status"
            >
              View status
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center animate-fade-in stagger-${i + 1}`}
                id={`stat-${i}`}
              >
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:text-brand-300">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CTA SECTION
         ════════════════════════════════════════════════ */}
      <section className="bg-surface-primary py-16 lg:py-24" id="cta">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-14 text-center shadow-float sm:px-12">
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
              aria-hidden="true"
            ></div>
            <div
              className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-400/40 blur-3xl"
              aria-hidden="true"
            ></div>

            <div className="relative max-w-xl mx-auto">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-3">
                Still Need Help?
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                We're here for you
              </h2>
              <p className="mt-3 text-base text-white/75 max-w-md mx-auto">
                Can't find what you're looking for? Our support team is ready to assist you.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/signup"
                  className={buttonStyles({ variant: 'inverse', size: 'lg' })}
                  id="cta-signup"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200"
                  id="cta-contact"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
