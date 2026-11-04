import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { Label, Input, FieldError } from '../components/ui/Field';
import { authApi } from '../api/auth';

const BackToLogin = () => (
  <Link
    to="/login"
    className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to log in
  </Link>
);

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState({ field: '', form: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ field: '', form: '' });
    setStatus('sending');
    try {
      await authApi.forgotPassword(email.trim());
      setStatus('sent');
    } catch (err) {
      setError({ field: err.errors.email ?? '', form: err.errors.email ? '' : err.message });
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="If an account exists for that email, a reset link is on its way."
        footer={<BackToLogin />}
      >
        <div className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-secondary p-4">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm leading-relaxed text-text-secondary">
            We sent it to <span className="font-semibold text-text-primary">{email.trim()}</span>.
            The link is valid for 30 minutes and works once. Don&apos;t see it? Check your spam
            folder.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to choose a new one."
      footer={<BackToLogin />}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Alert>{error.form}</Alert>
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
            invalid={Boolean(error.field)}
          />
          <FieldError>{error.field}</FieldError>
        </div>
        <Button type="submit" size="lg" fullWidth disabled={status === 'sending' || !email}>
          {status === 'sending' && <Spinner />}
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
};
