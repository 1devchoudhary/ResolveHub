import AppError from '../utils/AppError.js';
import {
  toTrimmedString,
  normalizeEmail,
  isValidEmail,
  normalizeMobile,
  toPassword,
  getPasswordError,
} from '../utils/validators.js';

// Which fields signup needs. Returns cleaned values, or throws a 400 with one message per field.
export const validateRegistration = (body = {}) => {
  const name = toTrimmedString(body.name);
  const email = normalizeEmail(body.email);
  const mobile = normalizeMobile(body.mobile);
  const password = toPassword(body.password);

  const errors = {};

  if (!name) errors.name = 'Name is required';
  else if (name.length > 100) errors.name = 'Name must be at most 100 characters';

  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email';

  if (!toTrimmedString(body.mobile)) errors.mobile = 'Mobile number is required';
  else if (!mobile) errors.mobile = 'Please enter a valid mobile number';

  const passwordError = getPasswordError(password);
  if (passwordError) errors.password = passwordError;

  if (body.agreeToTerms !== true) errors.agreeToTerms = 'You must accept the terms';

  if (Object.keys(errors).length > 0) {
    throw new AppError(400, 'Validation failed', errors);
  }

  return { name, email, mobile, password };
};
