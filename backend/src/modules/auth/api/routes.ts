import { Router } from 'express';

import { authMiddleware } from '../../../shared/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

import { authController } from './authController';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authMiddleware, asyncHandler(authController.me));

export default router;
