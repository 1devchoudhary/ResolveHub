import { z } from 'zod';
import { nameField, mobileField } from '../../utils/schemas.js';

// Email is deliberately not editable: changing it safely needs a verification flow
export const updateProfileSchema = z
  .object({
    name: nameField.optional(),
    mobile: mobileField.optional(),
    emailNotifications: z.boolean({ error: 'Must be true or false' }).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    error: 'Nothing to update',
    path: ['body'],
  });
