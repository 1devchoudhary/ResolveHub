export const validateName = (fullName) => {
  if (!fullName.trim()) return 'Name is required';

  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please Enter a Valid Email';

  return null;
};

// Optional prefix (+91 / 91 / 0), then a 10-digit Indian mobile starting with 6-9.
// The 10 digits are captured so normalizeMobile can rebuild one standard format.
const MOBILE_PATTERN = /^(?:\+91|91|0)?([6-9]\d{9})$/;

// Drop formatting characters: "+91 (98067) 643-65" -> "+919806764365"
const stripMobileFormatting = (mobile) => mobile.replace(/[\s\-().]/g, '');

export const validateMobile = (mobile) => {
  if (!mobile.trim()) return 'Mobile number is required';

  if (!MOBILE_PATTERN.test(stripMobileFormatting(mobile)))
    return 'Please Enter a Valid Mobile Number';

  return null;
};

// Any accepted format -> "+91XXXXXXXXXX" (E.164), so the same number is always stored the same way.
// Returns null for invalid input — validate first.
export const normalizeMobile = (mobile) => {
  const match = stripMobileFormatting(mobile).match(MOBILE_PATTERN);
  return match ? `+91${match[1]}` : null;
};

export const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be atleast 8 characters';

  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase character';

  if (!/[a-z]/.test(password)) return 'Password must contain lowercase character';
  return null;
};
