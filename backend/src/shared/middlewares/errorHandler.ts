import { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors';
import { ValidationError } from '../errors/ValidationError';
import { logger } from '../logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    logger.warn('Validation error', {
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.userId,
      fields: err.fields,
    });

    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      fields: err.fields,
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn('Handled application error', {
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.userId,
      error: err.message,
      statusCode: err.statusCode,
    });

    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  logger.error('Unhandled error', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}

