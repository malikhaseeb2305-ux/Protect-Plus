import { Router, Request, Response } from 'express';

import authRoutes from '../modules/auth/api/routes';
import userRoutes from '../modules/users/api/routes';
import locationRoutes from '../modules/locations/api/routes';
import weatherRoutes from '../modules/weather/api/routes';
import ruleRoutes from '../modules/rules/api/routes';
import alertRoutes from '../modules/alerts/api/routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/locations', locationRoutes);
router.use('/weather', weatherRoutes);
router.use('/rules', ruleRoutes);
router.use('/alerts', alertRoutes);

export default router;
