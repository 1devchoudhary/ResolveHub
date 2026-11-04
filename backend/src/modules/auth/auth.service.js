import bcrypt from 'bcryptjs';
import AppError from '../../utils/AppError.js';
import * as users from '../users/user.repository.js';

const SALT_ROUNDS = 12;

// Maps a unique-constraint name from Postgres to the field it protects
const UNIQUE_FIELDS = {
  users_email_key: 'email',
  users_mobile_key: 'mobile',
};

// Turns a duplicate email/mobile into a 409 that names the field; rethrows anything else
const rethrowUniqueViolation = (err) => {
  const field = err.code === '23505' && UNIQUE_FIELDS[err.constraint];
  if (field) {
    throw AppError.conflict(`An account with this ${field} already exists`, {
      [field]: `This ${field} is already registered`,
    });
  }
  throw err;
};

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

// Self-service signup always creates a customer: the role column default does that,
// and the request schema strips any "role" a client tries to send.
export const registerCustomer = async ({ name, email, mobile, password }) => {
  const passwordHash = await hashPassword(password);
  // Insert first and let the UNIQUE constraints decide: a SELECT-then-INSERT check
  // would race when two signups with the same email arrive at the same time
  return users.createUser({ name, email, mobile, passwordHash }).catch(rethrowUniqueViolation);
};
