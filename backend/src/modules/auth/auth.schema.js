import { z } from 'zod';
import { nameField, emailField, mobileField, newPasswordField } from '../../utils/schemas.js';

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  mobile: mobileField,
  password: newPasswordField,
  agreeToTerms: z.literal(true, { error: 'You must accept the terms' }),
});
