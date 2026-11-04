import { z } from 'zod';

// Reusable field schemas shared by the feature modules (signup, login, profile, admin…)

// Optional prefix (+91 / 91 / 0), then a 10-digit Indian mobile starting with 6-9
const MOBILE_PATTERN = /^(?:\+91|91|0)?([6-9]\d{9})$/;

// Any accepted format -> "+91XXXXXXXXXX" (E.164), matching the CHECK on users.mobile
export const normalizeMobile = (value) => {
  const match = String(value)
    .replace(/[\s\-().]/g, '')
    .match(MOBILE_PATTERN);
  return match ? `+91${match[1]}` : null;
};

export const nameField = z
  .string({ error: 'Name is required' })
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters');

export const emailField = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(254, 'Please enter a valid email')
  .pipe(z.email('Please enter a valid email'));

export const mobileField = z
  .string({ error: 'Mobile number is required' })
  .trim()
  .min(1, 'Mobile number is required')
  .refine((value) => normalizeMobile(value) !== null, 'Please enter a valid mobile number')
  .transform(normalizeMobile);

// Strength rules for a NEW password (signup, reset, change). Never trimmed: spaces are valid.
export const newPasswordField = z
  .string({ error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  // bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated
  .refine((value) => Buffer.byteLength(value) <= 72, 'Password must be at most 72 bytes')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter');

// For login: no strength rules (they apply when a password is created, not when it's used)
export const passwordField = z
  .string({ error: 'Password is required' })
  .min(1, 'Password is required')
  .max(200, 'Password is too long');

// Numeric route ids, e.g. /users/:id
export const idParam = z.coerce.number({ error: 'Invalid id' }).int().positive('Invalid id');

// ?page=&limit= with sane bounds so nobody can ask for a million rows
export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
