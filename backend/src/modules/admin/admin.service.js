import { withTransaction } from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import * as admin from './admin.repository.js';
import * as users from '../users/user.repository.js';
import * as tokens from '../auth/token.repository.js';
import { hashPassword, rethrowUniqueViolation } from '../auth/auth.service.js';

export const getAnalytics = async ({ days }) => {
  const [summary, daily, categories, statuses, agents] = await Promise.all([
    admin.summary({ days }),
    admin.dailyVolume({ days }),
    admin.byCategory({ days }),
    admin.byStatus(),
    admin.agentPerformance({ days }),
  ]);
  return { days, summary, daily, categories, byStatus: statuses, agents };
};

export const listUsers = async ({ role, q, page, limit }) => {
  const { items, total } = await admin.listUsers({ role, search: q, page, limit });
  return { items, page, limit, total };
};

// Staff accounts can only be created here; public signup always makes customers
export const createStaff = async ({ name, email, mobile, password, role }) => {
  const passwordHash = await hashPassword(password);
  return users
    .createUser({ name, email, mobile, passwordHash, role })
    .catch(rethrowUniqueViolation);
};

export const updateUser = async (actor, userId, { role, isActive }) => {
  if (userId === actor.id) {
    // Prevents an admin from locking everyone (including themselves) out of the admin portal
    throw AppError.badRequest("You can't change your own role or deactivate yourself");
  }

  return withTransaction(async (tx) => {
    const target = await users.findById(userId, tx);
    if (!target) throw AppError.notFound('User not found');

    // The shared demo accounts must keep working for the next visitor
    if (target.isDemo) {
      throw AppError.forbidden('Demo accounts can’t be changed. Create a new user to try this.');
    }
    if (role && (target.role === 'customer') !== (role === 'customer')) {
      throw AppError.badRequest('Customers and staff accounts can’t be converted into each other');
    }

    const updated = await users.updateUser(userId, { role, isActive }, tx);

    const leftAgentRole =
      target.role === 'agent' && (isActive === false || (role && role !== 'agent'));
    if (leftAgentRole) await admin.releaseActiveTickets({ agentId: userId, actorId: actor.id }, tx);

    // A deactivated account is signed out everywhere straight away (within the access token's
    // short lifetime), not just when its refresh token expires
    if (isActive === false) await tokens.revokeAllForUser(userId, {}, tx);

    return updated;
  });
};
