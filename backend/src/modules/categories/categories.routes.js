import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { idParam } from '../../utils/schemas.js';
import AppError from '../../utils/AppError.js';
import * as categories from './category.repository.js';

// Small CRUD module: thin enough that a separate controller/service layer would be ceremony

const nameField = z
  .string({ error: 'Name is required' })
  .trim()
  .min(1, 'Name is required')
  .max(60, 'Name must be at most 60 characters');

const createSchema = z.object({ name: nameField });
const updateSchema = z
  .object({ name: nameField.optional(), isActive: z.boolean().optional() })
  .refine((value) => value.name !== undefined || value.isActive !== undefined, {
    error: 'Nothing to update',
    path: ['body'],
  });

const rethrowDuplicate = (err) => {
  if (err.code === '23505') {
    throw AppError.conflict('A category with this name already exists', {
      name: 'A category with this name already exists',
    });
  }
  throw err;
};

const router = Router();

router.use(authenticate);

// Everyone signed in can read the active list (customers pick one when opening a ticket);
// admins also see retired ones
router.get('/', async (req, res) => {
  const items = await categories.listCategories({ includeInactive: req.user.role === 'admin' });
  sendSuccess(res, { data: { items } });
});

router.post('/', authorize('admin'), validate({ body: createSchema }), async (req, res) => {
  const category = await categories.createCategory(req.body).catch(rethrowDuplicate);
  sendSuccess(res, { statusCode: 201, message: 'Category created', data: { category } });
});

router.patch(
  '/:id',
  authorize('admin'),
  validate({ params: z.object({ id: idParam }), body: updateSchema }),
  async (req, res) => {
    const category = await categories
      .updateCategory(req.params.id, req.body)
      .catch(rethrowDuplicate);
    if (!category) throw AppError.notFound('Category not found');
    sendSuccess(res, { message: 'Category updated', data: { category } });
  },
);

export default router;
