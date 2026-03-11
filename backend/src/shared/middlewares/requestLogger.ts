import { Request, Response, NextFunction } from 'express';

import { logger } from '../logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info(`${req.method} ${req.originalUrl}`, {
      requestId: req.requestId,
      status: res.statusCode,
      durationMs: duration,
      userId: req.user?.userId,
      method: req.method,
      path: req.originalUrl,
    });
  });

  next();
}
