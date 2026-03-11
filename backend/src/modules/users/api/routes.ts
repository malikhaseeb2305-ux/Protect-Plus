import { Router } from 'express';

import { authMiddleware } from '../../../shared/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

import { userController } from './userController';

const router = Router();

router.patch('/me/settings', authMiddleware, asyncHandler(userController.updateSettings));

export default router;
