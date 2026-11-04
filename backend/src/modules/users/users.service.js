import AppError from '../../utils/AppError.js';
import { rethrowUniqueViolation } from '../auth/auth.service.js';
import * as users from './user.repository.js';

export const updateProfile = async (userId, changes) => {
  const user = await users.findById(userId);
  if (!user) throw AppError.unauthorized('Session expired');

  // Demo accounts are shared by every visitor, so keep them identical for the next one.
  // Notification preferences are harmless to toggle, so those stay allowed.
  if (user.isDemo && (changes.name !== undefined || changes.mobile !== undefined)) {
    throw AppError.forbidden('Demo accounts are read-only here. Sign up to try this.');
  }

  return users.updateUser(userId, changes).catch(rethrowUniqueViolation);
};
