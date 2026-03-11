import { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors';
import { logger } from '../logger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  name?: string;
}

type Bucket = {
  count: number;
  resetAt: number;
};

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, keyGenerator, name } = options;
  const buckets = new Map<string, Bucket>();

  return function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();
    const key =
      keyGenerator?.(req) ??
      req.ip ??
      req.headers['x-forwarded-for']?.toString().split(',')[0] ??
      'anonymous';

    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count < max) {
      bucket.count += 1;
      return next();
    }

    const retryAfterSeconds = Math.max(1, Math.round((bucket.resetAt - now) / 1000));
    res.setHeader('Retry-After', retryAfterSeconds.toString());

    logger.warn('Rate limit exceeded', {
      name,
      key,
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
    });

    throw new AppError('Too many requests, please try again later', 429);
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  name: 'auth',
  keyGenerator: (req) =>
    req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0] ?? 'anonymous',
});

export const ruleCreationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  name: 'rule-creation',
  keyGenerator: (req) => req.user?.userId ?? req.ip ?? 'anonymous',
});

