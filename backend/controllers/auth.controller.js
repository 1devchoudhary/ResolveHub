import bcrypt from 'bcryptjs';
import { createUser } from '../repositories/user.repository.js';
import { validateRegistration } from '../validators/auth.validator.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

const SALT_ROUNDS = 12;

// Maps a unique-constraint name from Postgres to the request field it protects
const UNIQUE_FIELDS = {
  users_email_key: 'email',
  users_mobile_key: 'mobile',
};

// Register new user
export const registerUser = async (req, res) => {
  // req.body is undefined when the request has no JSON body. Throws a 400 if invalid.
  const { name, email, mobile, password } = validateRegistration(req.body ?? {});

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await createUser({ name, email, mobile, passwordHash });
  } catch (err) {
    // Unique violation: the database is the source of truth, so no SELECT-before-INSERT race
    const field = err.code === '23505' && UNIQUE_FIELDS[err.constraint];
    if (field) {
      throw new AppError(409, `An account with this ${field} already exists`, {
        [field]: `This ${field} is already registered`,
      });
    }
    // Anything else is unexpected: the error handler logs it and returns a 500
    throw err;
  }

  return sendSuccess(res, { statusCode: 201, message: 'User created successfully', data: { user } });
};

export const loginUser = (req, res) => {

}
