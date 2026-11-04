import env from '../../config/env.js';
import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

// Controllers only translate HTTP <-> service calls. Input is already validated by the route.

export const REFRESH_COOKIE = 'rh_refresh';

// httpOnly: JavaScript can't read it, so an XSS bug can't steal the long-lived token.
// SameSite=Lax + a narrow path: it's only sent to /api/auth, never to other endpoints.
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86_400_000,
});

const requestMeta = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') });

// The refresh token goes in the cookie; only the short-lived access token is in the body
const sendSession = (res, { user, accessToken, refreshToken }, { statusCode = 200, message }) => {
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  return sendSuccess(res, { statusCode, message, data: { user, accessToken } });
};

export const register = async (req, res) => {
  const session = await authService.registerCustomer(req.body, requestMeta(req));
  return sendSession(res, session, { statusCode: 201, message: 'Account created' });
};

export const login = async (req, res) => {
  const session = await authService.login(req.body, requestMeta(req));
  return sendSession(res, session, { message: 'Signed in' });
};

export const refresh = async (req, res) => {
  try {
    const session = await authService.refresh(req.cookies[REFRESH_COOKIE], requestMeta(req));
    return sendSession(res, session, { message: 'Session refreshed' });
  } catch (err) {
    // A dead session shouldn't leave a useless cookie behind
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: undefined });
    throw err;
  }
};

export const logout = async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: undefined });
  return sendSuccess(res, { message: 'Signed out' });
};

export const me = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, { data: { user } });
};

export const changePassword = async (req, res) => {
  await authService.changePassword(req.user.id, req.body, req.cookies[REFRESH_COOKIE]);
  return sendSuccess(res, { message: 'Password updated. Other devices have been signed out.' });
};

export const forgotPassword = async (req, res) => {
  await authService.requestPasswordReset(req.body);
  return sendSuccess(res, {
    message: 'If an account exists for that email, we have sent a link to reset the password.',
  });
};

export const resetPassword = async (req, res) => {
  await authService.resetPassword(req.body);
  return sendSuccess(res, { message: 'Password updated. You can sign in now.' });
};
