import { Request, Response } from 'express';

import { validateOrThrow } from '../../../shared/utils/validateOrThrow';

import { userService } from '../application/userService';
import { UpdateSettingsSchema } from './dtos';

export const userController = {
  async updateSettings(req: Request, res: Response) {
    const data = validateOrThrow(UpdateSettingsSchema.safeParse(req.body));
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const user = await userService.updateSettings(userId, data);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  },
};
