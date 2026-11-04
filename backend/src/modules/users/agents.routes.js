import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { listAgents } from './user.repository.js';

const router = Router();

// Staff only: who a ticket can be assigned to
router.get('/', authenticate, authorize('agent', 'admin'), async (_req, res) => {
  sendSuccess(res, { data: { items: await listAgents() } });
});

export default router;
