import { Router } from 'express';
import { healthCheck, liveCheck } from '../controllers/healthController';

const router = Router();

router.get('/health', healthCheck);
router.get('/health/live', liveCheck);

export default router;
