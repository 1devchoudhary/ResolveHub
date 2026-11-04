import { z } from 'zod';
import {
  nameField,
  emailField,
  mobileField,
  newPasswordField,
  passwordField,
} from '../../utils/schemas.js';

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  mobile: mobileField,
  password: newPasswordField,
  agreeToTerms: z.literal(true, { error: 'You must accept the terms' }),
});

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
  // Which login page the request came from; each one only accepts its own role
  portal: z.enum(['customer', 'agent', 'admin']).default('customer'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string({ error: 'Reset token is required' }).min(1, 'Reset token is required').max(200),
  password: newPasswordField,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordField,
  newPassword: newPasswordField,
});
