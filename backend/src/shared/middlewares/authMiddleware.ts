import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config';
import { AuthError } from '../errors';
import { AuthTokenPayload } from '../../modules/auth/domain/types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    throw new AuthError('Authentication required');
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}
