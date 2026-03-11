import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../errors';

/**
 * Placeholder — full implementation in Phase 3 once JWT and User model exist.
 * Reads JWT from HTTP-only cookie, verifies, and attaches user to request.
 */
export function authMiddleware(_req: Request, _res: Response, _next: NextFunction): void {
  throw new AuthError('Auth middleware not yet implemented');
}
