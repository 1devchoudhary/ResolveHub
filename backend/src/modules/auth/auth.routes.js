import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema.js';
import * as auth from './auth.controller.js';

const router = Router();

const MINUTE = 60;
const HOUR = 60 * MINUTE;

// Per-IP limits on the endpoints attackers care about (credential stuffing, signup spam,
// email bombing). The login key includes the email so one office IP isn't locked out by
// a single person mistyping their password.
const limits = {
  register: rateLimit({ name: 'register', max: 10, windowSeconds: HOUR }),
  login: rateLimit({
    name: 'login',
    max: 10,
    windowSeconds: 15 * MINUTE,
    key: (req) => `${req.ip}:${String(req.body?.email ?? '').toLowerCase()}`,
  }),
  refresh: rateLimit({ name: 'refresh', max: 120, windowSeconds: 15 * MINUTE }),
  passwordEmail: rateLimit({ name: 'password-email', max: 5, windowSeconds: HOUR }),
  passwordReset: rateLimit({ name: 'password-reset', max: 10, windowSeconds: HOUR }),
};

router.post('/register', limits.register, validate({ body: registerSchema }), auth.register);
router.post('/login', limits.login, validate({ body: loginSchema }), auth.login);
router.post('/refresh', limits.refresh, auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);
// Under /api/auth so the refresh cookie (path=/api/auth) is sent: it identifies the session to keep
router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  auth.changePassword,
);
router.post(
  '/forgot-password',
  limits.passwordEmail,
  validate({ body: forgotPasswordSchema }),
  auth.forgotPassword,
);
router.post(
  '/reset-password',
  limits.passwordReset,
  validate({ body: resetPasswordSchema }),
  auth.resetPassword,
);

export default router;
