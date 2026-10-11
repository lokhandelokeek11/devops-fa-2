import { Router } from 'express';
import { stats, updateStatus } from '../controllers/adminController';
import { validateBody } from '../middleware/validate';
import { statusUpdateSchema } from '../utils/validators';

const router = Router();

router.get('/stats', stats);
router.patch('/requests/:id/status', validateBody(statusUpdateSchema), updateStatus);

export default router;
