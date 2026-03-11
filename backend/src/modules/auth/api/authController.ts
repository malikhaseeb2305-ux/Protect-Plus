import { Request, Response } from 'express';

import { config } from '../../../shared/config';
import { validateOrThrow } from '../../../shared/utils/validateOrThrow';
import { UserEntity } from '../../users/domain/types';

import { authService } from '../application/authService';
import { RegisterRequestSchema, LoginRequestSchema, UserResponseDto } from './dtos';

function mapToDto(user: UserEntity): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    preferences: {
      temperatureUnit: user.preferences.temperatureUnit,
    },
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? ('strict' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const authController = {
  async register(req: Request, res: Response) {
    const { email, password } = validateOrThrow(RegisterRequestSchema.safeParse(req.body));
    const { user, token } = await authService.register(email, password);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user: mapToDto(user) });
  },

  async login(req: Request, res: Response) {
    const { email, password } = validateOrThrow(LoginRequestSchema.safeParse(req.body));
    const { user, token } = await authService.login(email, password);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user: mapToDto(user) });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  },

  async me(req: Request, res: Response) {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const user = await authService.getCurrentUser(userId);
    res.json({ user: mapToDto(user) });
  },
};
