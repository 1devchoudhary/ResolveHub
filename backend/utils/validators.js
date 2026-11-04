// Reusable field rules: signup, login, profile update, admin creating agents…

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
// Optional prefix (+91 / 91 / 0), then a 10-digit Indian mobile starting with 6-9
export const MOBILE_PATTERN = /^(?:\+91|91|0)?([6-9]\d{9})$/;

// Anything that isn't a string (missing, number, object…) becomes "" so it fails "required"
export const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

export const normalizeEmail = (value) => toTrimmedString(value).toLowerCase();

export const isValidEmail = (email) => email.length <= 254 && EMAIL_PATTERN.test(email);

// Any accepted format -> "+91XXXXXXXXXX", matching the CHECK on users.mobile. null if invalid.
export const normalizeMobile = (value) => {
  const match = toTrimmedString(value).replace(/[\s\-().]/g, '').match(MOBILE_PATTERN);
  return match ? `+91${match[1]}` : null;
};

// Passwords are never trimmed: spaces are valid characters
export const toPassword = (value) => (typeof value === 'string' ? value : '');

// Strength rules for a NEW password (signup, change password). Not for login.
// Returns an error message, or null when the password is acceptable.
export const getPasswordError = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  // bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated
  if (Buffer.byteLength(password) > 72) return 'Password must be at most 72 bytes';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  return null;
};
