import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../lib/tokens.js';

// Requires a valid access token and puts { id, role } on req.user
export const authenticate = (req, _res, next) => {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Authentication required'));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (err) {
    // The frontend treats this exact message as "refresh and retry"
    if (err instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized('Access token expired'));
    }
    return next(AppError.unauthorized('Invalid access token'));
  }
};

// Role gate, used after authenticate:  router.use(authenticate, authorize('admin'))
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError.forbidden());
    }
    return next();
  };
