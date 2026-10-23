import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { Label, Input, PasswordInput } from '../components/ui/Field';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login submission
    console.log({ email, password, rememberMe });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your tickets."
      logoId="login-logo"
      footer={
        <>
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
            id="link-signup"
          >
            Sign up
          </Link>
        </>
      }
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
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
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong accent-brand-600 cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="ml-2.5 block text-sm text-text-secondary cursor-pointer select-none"
          >
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <Button type="submit" size="lg" fullWidth id="btn-login-submit">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
};
