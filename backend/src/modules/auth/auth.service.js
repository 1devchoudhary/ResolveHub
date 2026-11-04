import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import env from '../../config/env.js';
import { withTransaction } from '../../config/db.js';
import logger from '../../lib/logger.js';
import { generateToken, hashToken, signAccessToken } from '../../lib/tokens.js';
import { sendEmail } from '../../lib/mailer.js';
import { passwordResetEmail } from '../../lib/emailTemplates.js';
import AppError from '../../utils/AppError.js';
import * as users from '../users/user.repository.js';
import * as tokens from './token.repository.js';

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
// Two tabs refreshing at the same moment both send the same cookie. The loser of that race
// presents a token that was rotated a moment ago: that's not theft, so don't log everyone out.
const ROTATION_GRACE_MS = 15_000;

// bcrypt hash of a random value nobody knows. Comparing against it when the email doesn't exist
// makes "unknown email" take as long as "wrong password", so timing doesn't reveal accounts.
const DUMMY_PASSWORD_HASH = '$2b$12$1MeLRXq7254Q/rdeb8uSbebys6m5GZ01KhRBhpuDAVR6ZSVgSo4Ru';

// Each login page only accepts its own role
const PORTAL_ROLES = { customer: 'customer', agent: 'agent', admin: 'admin' };

const INVALID_CREDENTIALS = 'Invalid email or password';

// Maps a unique-constraint name from Postgres to the field it protects
const UNIQUE_FIELDS = {
  users_email_key: 'email',
  users_mobile_key: 'mobile',
};

// Turns a duplicate email/mobile into a 409 that names the field; rethrows anything else
export const rethrowUniqueViolation = (err) => {
  const field = err.code === '23505' && UNIQUE_FIELDS[err.constraint];
  if (field) {
    throw AppError.conflict(`An account with this ${field} already exists`, {
      [field]: `This ${field} is already registered`,
    });
  }
  throw err;
};

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

const refreshExpiry = () => new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000);

// Issues an access token plus a new refresh token. A login starts a new family;
// a refresh continues the family it came from.
const issueSession = async (user, { familyId = randomUUID(), meta }, db) => {
  const refreshToken = generateToken();
  const row = await tokens.insertRefreshToken(
    {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      familyId,
      expiresAt: refreshExpiry(),
      userAgent: meta?.userAgent?.slice(0, 300) ?? null,
      ip: meta?.ip ?? null,
    },
    db,
  );
  return { user, accessToken: signAccessToken(user), refreshToken, refreshTokenId: row.id };
};

// Self-service signup always creates a customer: the role column default does that, and the
// request schema strips any "role" a client tries to send. The user is signed in straight away.
export const registerCustomer = async ({ name, email, mobile, password }, meta) => {
  const passwordHash = await hashPassword(password);

  return withTransaction(async (tx) => {
    // Insert first and let the UNIQUE constraints decide: a SELECT-then-INSERT check
    // would race when two signups with the same email arrive at the same time
    const user = await users
      .createUser({ name, email, mobile, passwordHash }, tx)
      .catch(rethrowUniqueViolation);
    await users.touchLastLogin(user.id, tx);
    return issueSession(user, { meta }, tx);
  });
};

export const login = async ({ email, password, portal }, meta) => {
  const account = await users.findCredentialsByEmail(email);
  const passwordMatches = await bcrypt.compare(
    password,
    account?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  // Unknown email, wrong password and wrong portal all get the same answer
  if (!account || !passwordMatches || account.role !== PORTAL_ROLES[portal]) {
    throw AppError.unauthorized(INVALID_CREDENTIALS);
  }

  // Only revealed once the password is proven correct
  if (!account.isActive) {
    throw AppError.forbidden('This account has been deactivated. Contact your administrator.');
  }

  const { passwordHash: _passwordHash, ...user } = account;
  await users.touchLastLogin(user.id);
  return issueSession(user, { meta });
};

/**
 * Exchanges a refresh token for a new access token and a new refresh token (rotation).
 * The old token is revoked and points at its replacement. If a token that was already
 * rotated comes back after the grace window, someone kept a copy of it: the whole family
 * is revoked, which signs out both the attacker and the real user.
 */
export const refresh = async (rawToken, meta) => {
  if (!rawToken) throw AppError.unauthorized('No session');

  const outcome = await withTransaction(async (tx) => {
    const stored = await tokens.findRefreshTokenForUpdate(hashToken(rawToken), tx);
    if (!stored) return { error: 'Invalid session' };

    if (stored.revokedAt) {
      const rotatedRecently =
        stored.replacedBy && Date.now() - new Date(stored.revokedAt).getTime() < ROTATION_GRACE_MS;
      if (stored.replacedBy && !rotatedRecently) {
        // Committed (not thrown) so the revocation survives
        await tokens.revokeFamily(stored.familyId, tx);
        return { error: 'Session expired', reuse: stored };
      }
      return { error: 'Session expired' };
    }

    if (new Date(stored.expiresAt) <= new Date()) return { error: 'Session expired' };

    const user = await users.findById(stored.userId, tx);
    if (!user || !user.isActive) {
      await tokens.revokeFamily(stored.familyId, tx);
      return { error: 'Session expired' };
    }

    const session = await issueSession(user, { familyId: stored.familyId, meta }, tx);
    await tokens.markRotated(stored.id, session.refreshTokenId, tx);
    return { session };
  });

  if (outcome.reuse) {
    logger.warn(
      { userId: outcome.reuse.userId, familyId: outcome.reuse.familyId, ip: meta?.ip },
      'Refresh token reuse detected, session family revoked',
    );
  }
  if (outcome.error) throw AppError.unauthorized(outcome.error);
  return outcome.session;
};

export const logout = async (rawToken) => {
  if (!rawToken) return;
  await tokens.revokeByHash(hashToken(rawToken));
};

export const getCurrentUser = async (userId) => {
  const user = await users.findById(userId);
  if (!user || !user.isActive) throw AppError.unauthorized('Session expired');
  return user;
};

const assertNotDemo = (user) => {
  if (user.isDemo) {
    throw AppError.forbidden('Demo accounts are read-only here. Sign up to try this.');
  }
};

// Changing the password signs out every other device, but keeps this session
export const changePassword = async (userId, { currentPassword, newPassword }, rawRefreshToken) => {
  const account = await users.findCredentialsById(userId);
  if (!account) throw AppError.unauthorized('Session expired');
  assertNotDemo(account);

  if (!(await bcrypt.compare(currentPassword, account.passwordHash))) {
    throw AppError.badRequest('Validation failed', {
      currentPassword: 'Current password is incorrect',
    });
  }

  const passwordHash = await hashPassword(newPassword);
  const current = rawRefreshToken
    ? await tokens.findFamilyIdByHash(hashToken(rawRefreshToken))
    : null;
  const keepFamily = current?.userId === userId ? current.familyId : null;

  await withTransaction(async (tx) => {
    await users.updatePassword(userId, passwordHash, tx);
    await tokens.revokeAllForUser(userId, { exceptFamilyId: keepFamily }, tx);
  });
};

// Always resolves the same way, whether or not the email exists (no account enumeration)
export const requestPasswordReset = async ({ email }) => {
  const user = await users.findByEmail(email);
  if (!user || !user.isActive || user.isDemo) return;

  const token = generateToken();
  await withTransaction((tx) =>
    tokens.insertPasswordResetToken(
      {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
      tx,
    ),
  );

  sendEmail({ to: user.email, ...passwordResetEmail({ name: user.name, token }) });
};

// A reset proves control of the inbox, so every existing session is revoked
export const resetPassword = async ({ token, password }) => {
  const passwordHash = await hashPassword(password);

  await withTransaction(async (tx) => {
    const claimed = await tokens.consumePasswordResetToken(hashToken(token), tx);
    if (!claimed) {
      throw AppError.badRequest('This reset link is invalid or has expired', {
        token: 'This reset link is invalid or has expired',
      });
    }
    await users.updatePassword(claimed.userId, passwordHash, tx);
    await tokens.revokeAllForUser(claimed.userId, {}, tx);
  });
};
