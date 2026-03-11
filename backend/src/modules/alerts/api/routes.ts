import { Router } from 'express';

import { authMiddleware } from '../../../shared/middlewares/authMiddleware';

import { alertController } from './alertController';

const router = Router();

router.use(authMiddleware);

router.get('/stream', alertController.stream);

router.get('/', alertController.getAlerts);
router.get('/unread-count', alertController.getUnreadCount);
router.patch('/:id/read', alertController.markRead);
router.patch('/read-all', alertController.markAllRead);

export default router;
