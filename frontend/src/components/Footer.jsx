import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';

const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const socialLinkClasses =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-surface-primary text-text-tertiary hover:text-text-primary hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'How it Works', to: '/#how-it-works' },
        { label: 'Help Topics', to: '/#popular-topics' },
        { label: 'Customer Portal', to: '/app' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', to: '/contact' },
        { label: 'Submit a Ticket', to: '/login' },
        { label: 'Track a Ticket', to: '/login' },
        { label: 'System Status', to: '/', isStatus: true },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' },
        { label: 'Privacy Policy', to: '/' },
        { label: 'Terms of Service', to: '/' },
      ],
    },
  ];

  return (
    <footer className="bg-surface-secondary border-t border-border-default" id="site-footer">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Logo id="footer-logo" />
            <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-xs">
              Fast, friendly support for every customer. Manage tickets, resolve issues, and keep
              your team in sync.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/1devendra-choudhary"
                target="_blank"
                rel="noopener noreferrer"
                className={socialLinkClasses}
                aria-label="LinkedIn"
                id="social-linkedin"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/1devchoudhary/ResolveHub"
                target="_blank"
                rel="noopener noreferrer"
                className={socialLinkClasses}
                aria-label="GitHub"
                id="social-github"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-primary">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200"
                    >
                      {link.label}
                      {link.isStatus && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-tertiary">
            © {currentYear} ResolveHub. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <span>Built with</span>
            <span className="text-status-danger">♥</span>
            <span>by</span>
            <a
              href="https://github.com/1devchoudhary"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
            >
              1devChoudhary
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
