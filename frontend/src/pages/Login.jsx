import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Headset, ShieldCheck, Sparkles } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { Label, Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../context/authContext';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, PORTALS, homeFor } from '../utilities/portals';

const linkClasses =
  'font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200';

// Copy per login page. Staff pages don't offer signup: admins create those accounts.
const COPY = {
  customer: {
    title: 'Welcome back',
    subtitle: 'Log in to manage your tickets.',
    footer: (
      <>
        Don&apos;t have an account?{' '}
        <Link to="/signup" className={linkClasses} id="link-signup">
          Sign up
        </Link>
      </>
    ),
  },
  agent: {
    title: 'Agent sign in',
    subtitle: 'Pick up your queue and help customers faster.',
    icon: Headset,
    footer: (
      <>
        Not an agent?{' '}
        <Link to="/login" className={linkClasses}>
          Customer login
        </Link>
      </>
    ),
  },
  admin: {
    title: 'Admin sign in',
    subtitle: 'Manage your team, categories and performance.',
    icon: ShieldCheck,
    footer: (
      <>
        Not an admin?{' '}
        <Link to="/login" className={linkClasses}>
          Customer login
        </Link>
      </>
    ),
  },
};

// Used for /login, /agent/login and /admin/login. Each only accepts its own role.
export const Login = ({ portal = 'customer' }) => {
  const { status, user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(null); // 'form' | 'demo' | null

  const copy = COPY[portal];
  const demo = DEMO_ACCOUNTS[portal];

  // Already signed in: go straight to the right portal
  if (status === 'authenticated') return <Navigate to={homeFor(user.role)} replace />;

  const signIn = async (credentials, source) => {
    setError('');
    setSubmitting(source);
    try {
      const signedInUser = await login({ ...credentials, portal });
      // Back to the page they were trying to open, if it belongs to this portal
      const from = location.state?.from;
      const home = homeFor(signedInUser.role);
      navigate(from?.startsWith(home) ? from : home, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn({ email, password }, 'form');
  };

  return (
    <AuthLayout
      title={copy.title}
      subtitle={copy.subtitle}
      logoId="login-logo"
      badge={
        copy.icon && (
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <copy.icon className="h-3.5 w-3.5" />
            {PORTALS[portal].label} portal
          </span>
        )
      }
      footer={copy.footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5" id="login-form" noValidate>
        <Alert>{error}</Alert>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              id="link-forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            toggleId="toggle-password"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          id="btn-login-submit"
          disabled={Boolean(submitting) || !email || !password}
        >
          {submitting === 'form' && <Spinner />}
          Log in
        </Button>
      </form>

      {/* One-click demo: lets a visitor explore without creating an account */}
      <div className="mt-6">
        <div className="relative flex items-center">
          <span className="h-px flex-1 bg-border-default" />
          <span className="px-3 text-xs font-medium text-text-tertiary">or explore instantly</span>
          <span className="h-px flex-1 bg-border-default" />
        </div>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          className="mt-4"
          id="btn-demo-login"
          disabled={Boolean(submitting)}
          onClick={() => signIn({ email: demo.email, password: DEMO_PASSWORD }, 'demo')}
        >
          {submitting === 'demo' ? <Spinner /> : <Sparkles className="h-4 w-4 text-brand-600" />}
          Try the demo {PORTALS[portal].label.toLowerCase()} account
        </Button>
        <p className="mt-2 text-center text-xs text-text-tertiary">
          Signs you in as {demo.name}. Shared demo data, reset daily.
        </p>
      </div>
    </AuthLayout>
  );
};
