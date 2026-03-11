import { Request, Response } from 'express';

import { logger } from '../../../shared/logger';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { validateOrThrow } from '../../../shared/utils/validateOrThrow';

import { alertService } from '../application/alertService';
import { alertEventBus } from '../infrastructure/alertEventBus';
import { AlertQuerySchema, toAlertResponse } from './dtos';

function getUserId(req: Request): string {
  return (req as Request & { user: { userId: string } }).user.userId;
}

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? raw[0] : raw;
}

export const alertController = {
  getAlerts: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { page, limit } = validateOrThrow(AlertQuerySchema.safeParse(req.query));
    const alerts = await alertService.getAlerts(userId, page, limit);
    res.json(alerts.map(toAlertResponse));
  }),

  getUnreadCount: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const count = await alertService.getUnreadCount(userId);
    res.json({ count });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const notificationId = getParamId(req);
    const alert = await alertService.markRead(userId, notificationId);
    res.json(toAlertResponse(alert));
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    await alertService.markAllRead(userId);
    res.json({ success: true });
  }),

  /**
   * SSE endpoint — streams real-time alert events to the authenticated user.
   * The connection stays open; the client receives `data:` frames as alerts fire.
   * A heartbeat comment is sent every 30s to keep the connection alive through proxies.
   */
  stream(req: Request, res: Response): void {
    const userId = getUserId(req);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(':ok\n\n');

    const heartbeat = setInterval(() => {
      res.write(':heartbeat\n\n');
    }, 30_000);

    const unsubscribe = alertEventBus.subscribe(userId, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    logger.debug('SSE client connected', { userId });

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
      logger.debug('SSE client disconnected', { userId });
    });
  },
};
