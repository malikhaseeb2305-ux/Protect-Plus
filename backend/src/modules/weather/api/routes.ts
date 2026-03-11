import { Router } from 'express';

import { authMiddleware } from '../../../shared/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

import { weatherController } from './weatherController';

const router = Router();

router.use(authMiddleware);

router.get('/:locationId', asyncHandler(weatherController.getWeather));

export default router;
