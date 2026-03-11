import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

function generateRequestId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const incomingId =
    (req.headers['x-request-id'] as string | undefined) ||
    (req.headers['x-correlation-id'] as string | undefined);

  const requestId = incomingId && incomingId.trim().length > 0 ? incomingId : generateRequestId();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
}

