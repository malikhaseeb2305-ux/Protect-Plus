import { Router } from 'express';

import { authMiddleware, authRateLimiter } from '../../../shared/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

import { authController } from './authController';

const router = Router();

router.post('/register', authRateLimiter, asyncHandler(authController.register));
router.post('/login', authRateLimiter, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authMiddleware, asyncHandler(authController.me));

export default router;
