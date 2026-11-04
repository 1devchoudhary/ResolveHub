import { Link } from 'react-router-dom';
import { Heart, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { Eyebrow, SectionHeading } from '../components/ui/SectionHeading';
import { Avatar } from '../components/ui/Avatar';
import { buttonStyles } from '../components/ui/styles';

export const About = () => {
  const stats = [
    { value: '10K+', label: 'teams' },
    { value: '2M+', label: 'tickets resolved' },
    { value: '98%', label: 'satisfaction' },
    { value: '40+', label: 'countries' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer first',
      description:
        'Every feature we build begins with the question: how does this help the customer?',
    },
    {
      icon: Sparkles,
      title: 'Simple by design',
      description:
        'We strip away clutter so teams can focus on fast, empathetic resolution without friction.',
    },
    {
      icon: TrendingUp,
      title: 'Always improving',
      description:
        'We listen to customer feedback daily to iterate rapidly and elevate the support craft.',
    },
  ];

  const teamMembers = [
    { name: 'Alex Rivera', role: 'Co-Founder & CEO' },
    { name: 'Sarah Chen', role: 'Head of Product' },
    { name: 'Dev Choudhary', role: 'Lead Architect' },
    { name: 'Elena Rostova', role: 'Head of Customer Success' },
  ];

  return (
    <main className="bg-surface-primary">
      {/* ──────────────── 1. HERO SECTION ──────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_65%)]"
          aria-hidden="true"
        ></div>
        <div className="relative py-20 sm:py-28 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow className="mb-6 animate-fade-in">About us</Eyebrow>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.1] animate-fade-in stagger-1 text-balance">
            We make customer support{' '}
            <span className="bg-linear-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              feel human
            </span>
            .
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-in stagger-2 text-pretty">
            We believe customer support shouldn't feel like navigating a maze. ResolveHub gives
            fast-growing teams the clarity and speed to resolve issues effortlessly.
          </p>
        </div>
      </section>

      {/* ──────────────── 2. OUR STORY SECTION ──────────────── */}
      <section className="py-16 sm:py-24 bg-surface-secondary border-y border-border-default">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Text */}
            <div>
              <SectionHeading
                align="left"
                eyebrow="Our Story"
                title="Built by teams tired of clunky ticketing tools."
              />
              <div className="mt-6 space-y-4 text-base text-text-secondary leading-relaxed">
                <p>
                  Like most engineering and support teams, we spent years bouncing between bloated
                  enterprise suites that took weeks to configure and felt colder than a spreadsheet.
                  Customers were left waiting in silence, and agents were drowned in tabs.
                </p>
                <p>
                  In 2024, we set out to build ResolveHub: a streamlined, lightning-fast platform
                  combining conversational warmth with high-density productivity. Today, thousands
                  of modern companies rely on ResolveHub to turn difficult support tickets into
                  lasting customer relationships.
                </p>
              </div>
            </div>

            {/* Right Column: Abstract Minimal Illustration (theme-aware fills) */}
            <div className="flex items-center justify-center p-8 bg-surface-primary rounded-2xl border border-border-default shadow-medium">
              <svg
                className="w-full max-w-md h-auto"
                viewBox="0 0 360 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Background soft shapes */}
                <circle cx="180" cy="130" r="100" fill="var(--color-brand-50)" />
                <rect x="50" y="40" width="120" height="90" rx="16" fill="var(--color-brand-100)" />
                <rect
                  x="190"
                  y="130"
                  width="130"
                  height="90"
                  rx="16"
                  fill="var(--color-brand-200)"
                  opacity="0.7"
                />

                {/* Central overlapping cards */}
                <g style={{ filter: 'drop-shadow(0px 8px 16px rgba(79, 70, 229, 0.15))' }}>
                  <rect
                    x="80"
                    y="70"
                    width="200"
                    height="120"
                    rx="14"
                    fill="var(--color-surface-elevated)"
                    stroke="var(--color-border-default)"
                    strokeWidth="2"
                  />
                  {/* Card top bar */}
                  <rect
                    x="100"
                    y="92"
                    width="70"
                    height="10"
                    rx="5"
                    fill="var(--color-brand-600)"
                  />
                  <rect
                    x="235"
                    y="92"
                    width="25"
                    height="10"
                    rx="5"
                    fill="var(--color-status-success)"
                  />
                  {/* Card rows */}
                  <rect
                    x="100"
                    y="116"
                    width="160"
                    height="8"
                    rx="4"
                    fill="var(--color-surface-tertiary)"
                  />
                  <rect
                    x="100"
                    y="132"
                    width="120"
                    height="8"
                    rx="4"
                    fill="var(--color-surface-tertiary)"
                  />
                  <rect
                    x="100"
                    y="148"
                    width="90"
                    height="8"
                    rx="4"
                    fill="var(--color-surface-tertiary)"
                  />
                </g>

                {/* Accent floating chat bubble */}
                <g transform="translate(210, 45)">
                  <rect width="64" height="48" rx="12" fill="var(--color-brand-600)" />
                  <path d="M16 48L24 40H16V48Z" fill="var(--color-brand-600)" />
                  <circle cx="22" cy="24" r="3" fill="#FFFFFF" />
                  <circle cx="32" cy="24" r="3" fill="#FFFFFF" />
                  <circle cx="42" cy="24" r="3" fill="#FFFFFF" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 3. STATS ROW ──────────────── */}
      <section className="py-16 bg-surface-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 text-center lg:divide-x divide-border-default">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-linear-to-b from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-brand-300 dark:to-brand-500">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-text-secondary capitalize">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 4. OUR VALUES ──────────────── */}
      <section className="py-20 sm:py-24 bg-surface-secondary border-t border-border-default">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Core Principles"
            title="Our values"
            description="The fundamental guidelines that drive our software and decisions every day."
            className="mb-14"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="group bg-surface-primary rounded-xl border border-border-default p-8 shadow-soft hover:-translate-y-0.5 hover:shadow-large hover:border-brand-200 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 dark:text-brand-300 mb-6 group-hover:bg-brand-100 transition-colors">
                  <v.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 5. MEET THE TEAM ──────────────── */}
      <section className="py-20 sm:py-24 bg-surface-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Leadership"
            title="Meet the team"
            description="The passionate people crafting the next generation of customer support tools."
            className="mb-14"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-surface-primary rounded-xl border border-border-default p-6 text-center shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300"
              >
                <Avatar
                  name={member.name}
                  size="xl"
                  className="mx-auto mb-4 ring-4 ring-surface-secondary"
                />
                <h3 className="text-base font-bold text-text-primary">{member.name}</h3>
                <p className="mt-1 text-xs text-text-secondary font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 6. CALL TO ACTION BAND ──────────────── */}
      <section className="bg-brand-50 border-t border-brand-200 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Ready to deliver better support?
          </h2>
          <p className="mt-3 text-base text-text-secondary max-w-xl mx-auto">
            Join thousands of teams resolving issues faster and keeping customers delighted.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className={`${buttonStyles({ size: 'lg' })} w-full sm:w-auto`}>
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className={`${buttonStyles({ variant: 'secondary', size: 'lg' })} w-full sm:w-auto`}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
