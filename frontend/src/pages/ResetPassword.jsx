import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { Label, PasswordInput, FieldError, FieldHint } from '../components/ui/Field';
import { authApi } from '../api/auth';
import { validatePassword } from '../utilities/validation';

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(token ? '' : 'This reset link is incomplete.');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nextErrors = {};
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    if (confirm !== password) nextErrors.confirm = 'Passwords do not match';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password updated. Log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors({ password: err.errors.password });
      setFormError(err.errors.token ?? (err.errors.password ? '' : err.message));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="You'll be signed out of every other device."
      footer={
        <>
          Link expired?{' '}
          <Link
            to="/forgot-password"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Request a new one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Alert>{formError}</Alert>
        <div>
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <FieldError>{errors.password}</FieldError>
          ) : (
            <FieldHint>Use 8+ characters with upper & lowercase letters.</FieldHint>
          )}
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            invalid={Boolean(errors.confirm)}
          />
          <FieldError>{errors.confirm}</FieldError>
        </div>
        <Button type="submit" size="lg" fullWidth disabled={submitting || !token}>
          {submitting && <Spinner />}
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};
