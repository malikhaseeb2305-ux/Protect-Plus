import { Router } from 'express';

import { authMiddleware } from '../../../shared/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

import { locationController } from './locationController';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(locationController.list));
router.post('/', asyncHandler(locationController.create));
router.put('/:id', asyncHandler(locationController.update));
router.delete('/:id', asyncHandler(locationController.remove));
router.patch('/reorder', asyncHandler(locationController.reorder));
router.post('/detect', asyncHandler(locationController.detect));

export default router;
