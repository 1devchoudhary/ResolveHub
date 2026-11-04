import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema } from './users.schema.js';
import * as usersController from './users.controller.js';

const router = Router();

router.use(authenticate);

router.patch('/me', validate({ body: updateProfileSchema }), usersController.updateMe);

export default router;
