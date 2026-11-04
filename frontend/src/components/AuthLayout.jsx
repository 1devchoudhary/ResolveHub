import { CircleCheckBig, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from './ui/Logo';
import { ThemeToggle } from './ui/ThemeToggle';
import { Avatar } from './ui/Avatar';

// Split layout shared by the auth pages: form on the left, product visual on the right
export const AuthLayout = ({ title, subtitle, children, footer, logoId, badge }) => (
  <div className="min-h-screen flex flex-col lg:flex-row bg-surface-primary">
    {/* ──────────────── Left Half: Form ──────────────── */}
    <div className="relative w-full lg:w-1/2 flex flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
      <div className="flex items-center justify-between">
        <Logo size="lg" id={logoId} />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-[400px] animate-fade-in">
          <div className="mb-8">
            {badge}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
          </div>

          {children}

          {footer && <p className="mt-8 text-center text-sm text-text-secondary">{footer}</p>}
        </div>
      </div>

      <p className="text-center text-xs text-text-tertiary lg:text-left">
        © {new Date().getFullYear()} ResolveHub · Secure, encrypted sign-in
      </p>
    </div>

    {/* ──────────────── Right Half: Product visual ──────────────── */}
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-12 xl:p-16 text-white select-none">
      {/* Background texture + glows */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-400/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl"
        aria-hidden="true"
      />

      <span className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
        <Sparkles className="h-3.5 w-3.5" />
        Customer support, simplified
      </span>

      {/* Floating product preview */}
      <div className="relative mx-auto my-12 w-full max-w-md">
        {/* Ticket card */}
        <div className="rounded-2xl border border-white/15 bg-white/95 p-5 text-slate-900 shadow-float backdrop-blur animate-float-slow dark:bg-slate-900/90 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
              RH-1042
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Resolved
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold">Webhook deliveries failing with 401</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Technical issue · opened 2 days ago
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <Avatar name="Priya Sharma" size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold">
                Priya Sharma{' '}
                <span className="font-normal text-slate-500 dark:text-slate-400">· Support</span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Rotated your signing secret and replayed the failed events — all 214 delivered. ✅
              </p>
            </div>
          </div>
        </div>

        {/* Floating stat chips */}
        <div className="absolute -left-8 -bottom-8 flex items-center gap-3 rounded-xl border border-white/15 bg-white/95 px-4 py-3 text-slate-900 shadow-float animate-float dark:bg-slate-900/90 dark:text-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">1h 42m</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Avg. first response
            </p>
          </div>
        </div>
        <div
          className="absolute -right-6 -top-7 flex items-center gap-2 rounded-xl border border-white/15 bg-white/95 px-3.5 py-2.5 text-slate-900 shadow-float animate-float dark:bg-slate-900/90 dark:text-slate-100"
          style={{ animationDelay: '1.2s' }}
        >
          <CircleCheckBig className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-semibold">98% CSAT</p>
        </div>
      </div>

      {/* Quote + trust strip */}
      <div className="relative">
        <p className="text-xl font-semibold leading-snug tracking-tight text-balance">
          “Support that feels effortless — for customers and for the team behind them.”
        </p>
        <div className="mt-6 flex items-center gap-6 text-sm text-white/80">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> JWT-secured
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" /> 24/7 tracking
          </span>
        </div>
      </div>
    </div>
  </div>
);
