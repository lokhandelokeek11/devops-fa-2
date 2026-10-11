import { Router } from 'express';
import { create, getById, list, remove, update } from '../controllers/requestController';
import { validateBody, validateQuery } from '../middleware/validate';
import { createRequestSchema, listQuerySchema, updateRequestSchema } from '../utils/validators';

const router = Router();

router.get('/', validateQuery(listQuerySchema), list);
router.get('/:id', getById);
router.post('/', validateBody(createRequestSchema), create);
router.put('/:id', validateBody(updateRequestSchema), update);
router.delete('/:id', remove);

export default router;
