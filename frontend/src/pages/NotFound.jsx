import { Link } from 'react-router-dom';
import { ArrowLeft, LifeBuoy } from 'lucide-react';
import { buttonStyles } from '../components/ui/styles';

export const NotFound = () => (
  <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-24">
    <div className="absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_65%)]" aria-hidden="true"></div>
    <div className="relative text-center">
      <p className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">ERROR 404</p>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-text-primary sm:text-6xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-base text-text-secondary">
        This page wandered off without opening a ticket. Let’s get you back on track.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/" className={buttonStyles({ size: 'lg' })}>
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <Link to="/contact" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
          <LifeBuoy className="h-4 w-4" /> Contact support
        </Link>
      </div>
    </div>
  </main>
);
