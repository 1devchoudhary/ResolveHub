import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { registerSchema } from './auth.schema.js';
import * as auth from './auth.controller.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), auth.register);

export default router;
