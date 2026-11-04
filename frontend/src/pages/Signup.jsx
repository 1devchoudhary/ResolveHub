import { Link, Navigate } from 'react-router-dom';
import { useSignUp } from '../hooks/useSignUp';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/authContext';
import { homeFor } from '../utilities/portals';
import { Label, Input, PasswordInput, FieldError, FieldHint } from '../components/ui/Field';

export const Signup = () => {
  const { status, user } = useAuth();
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    mobile,
    setMobile,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    agreeTerms,
    setAgreeTerms,
    error,
    formError,
    submitting,
    registerUser,
  } = useSignUp();

  if (status === 'authenticated') return <Navigate to={homeFor(user.role)} replace />;

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with fast, effortless support."
      logoId="signup-logo"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
            id="link-to-login"
          >
            Log in
          </Link>
        </>
      }
    >
      {/* Form */}
      <form onSubmit={registerUser} className="space-y-4" id="signup-form" noValidate>
        <Alert>{formError}</Alert>

        {/* Full Name Field */}
        <div>
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            invalid={Boolean(error.fullName)}
          />
          <FieldError>{error.fullName}</FieldError>
        </div>

        {/* Email Field */}
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
            invalid={Boolean(error.email)}
          />
          <FieldError>{error.email}</FieldError>
        </div>

        {/* Mobile Field */}
        <div>
          <Label htmlFor="mobile">Mobile number</Label>
          <Input
            id="mobile"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+91 98765 43210"
            invalid={Boolean(error.mobile)}
          />
          {error.mobile ? (
            <FieldError>{error.mobile}</FieldError>
          ) : (
            <FieldHint>Only used for urgent updates on your tickets.</FieldHint>
          )}
        </div>

        {/* Password Field */}
        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            toggleId="toggle-signup-password"
            invalid={Boolean(error.password)}
          />
          {error.password ? (
            <FieldError>{error.password}</FieldError>
          ) : (
            <FieldHint>Use 8+ characters with upper & lowercase letters.</FieldHint>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="pt-1">
          <div className="flex items-start">
            <input
              id="agree-terms"
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-border-strong accent-brand-600 cursor-pointer"
            />
            <label
              htmlFor="agree-terms"
              className="ml-2.5 block text-xs text-text-secondary cursor-pointer select-none leading-relaxed"
            >
              I agree to the{' '}
              <a
                href="#"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </label>
          </div>
          <FieldError>{error.agreeTerms}</FieldError>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-2"
          id="btn-signup-submit"
          disabled={submitting}
        >
          {submitting && <Spinner />}
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};
