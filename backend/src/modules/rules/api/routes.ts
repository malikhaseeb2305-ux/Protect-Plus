import { Router } from 'express';

import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { ruleCreationRateLimiter } from '../../../shared/middlewares';

import { ruleController } from './ruleController';

const router = Router();

router.use(authMiddleware);

router.get('/', ruleController.getRules);
router.post('/', ruleCreationRateLimiter, ruleController.createRule);
router.put('/:id', ruleController.updateRule);
router.delete('/:id', ruleController.deleteRule);

export default router;
