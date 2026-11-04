import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import {
  emailField,
  idParam,
  mobileField,
  nameField,
  newPasswordField,
  pagination,
} from '../../utils/schemas.js';
import * as adminService from './admin.service.js';

const analyticsSchema = z.object({
  days: z.coerce
    .number()
    .int()
    .refine((d) => [7, 30, 90].includes(d), 'Use 7, 30 or 90')
    .default(30),
});

const listUsersSchema = z.object({
  role: z.enum(['customer', 'agent', 'admin']).optional(),
  q: z.string().trim().max(100).optional(),
  ...pagination,
});

const createStaffSchema = z.object({
  name: nameField,
  email: emailField,
  mobile: mobileField,
  password: newPasswordField,
  role: z.enum(['agent', 'admin'], { error: 'Choose agent or admin' }),
});

const updateUserSchema = z
  .object({
    role: z.enum(['customer', 'agent', 'admin']).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isActive !== undefined, {
    error: 'Nothing to update',
    path: ['body'],
  });

const router = Router();

// Everything here is admin-only
router.use(authenticate, authorize('admin'));

router.get('/analytics', validate({ query: analyticsSchema }), async (req, res) => {
  sendSuccess(res, { data: await adminService.getAnalytics(req.query) });
});

router.get('/users', validate({ query: listUsersSchema }), async (req, res) => {
  sendSuccess(res, { data: await adminService.listUsers(req.query) });
});

router.post('/users', validate({ body: createStaffSchema }), async (req, res) => {
  const user = await adminService.createStaff(req.body);
  sendSuccess(res, { statusCode: 201, message: `${user.name} can now sign in`, data: { user } });
});

router.patch(
  '/users/:id',
  validate({ params: z.object({ id: idParam }), body: updateUserSchema }),
  async (req, res) => {
    const user = await adminService.updateUser(req.user, req.params.id, req.body);
    sendSuccess(res, { message: 'User updated', data: { user } });
  },
);

export default router;
