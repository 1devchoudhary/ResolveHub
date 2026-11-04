// Where each role signs in and lands afterwards
export const PORTALS = {
  customer: { home: '/app', login: '/login', label: 'Customer' },
  agent: { home: '/agent', login: '/agent/login', label: 'Agent' },
  admin: { home: '/admin', login: '/admin/login', label: 'Admin' },
};

export const homeFor = (role) => PORTALS[role]?.home ?? '/';
export const loginFor = (role) => PORTALS[role]?.login ?? '/login';

// Public demo accounts created by the seed script (shown on the login pages on purpose)
export const DEMO_PASSWORD = 'Demo@1234';
export const DEMO_ACCOUNTS = {
  customer: { email: 'demo.customer@resolvehub.dev', name: 'Rohan Mehta' },
  agent: { email: 'demo.agent@resolvehub.dev', name: 'Priya Sharma' },
  admin: { email: 'demo.admin@resolvehub.dev', name: 'Aditi Verma' },
};
