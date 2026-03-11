import { Request, Response } from 'express';
import { weatherService } from '../application/weatherService';

function getUserId(req: Request): string {
  return (req as Request & { user: { userId: string } }).user.userId;
}

function getParamId(req: Request): string {
  const id = req.params.locationId;
  return Array.isArray(id) ? id[0] : id;
}

export const weatherController = {
  async getWeather(req: Request, res: Response) {
    const data = await weatherService.getWeather(getUserId(req), getParamId(req));
    res.json(data);
  },
};
