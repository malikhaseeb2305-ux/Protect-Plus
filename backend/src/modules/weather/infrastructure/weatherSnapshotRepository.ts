import { WeatherSnapshotModel, WeatherSnapshotDocument } from './weatherSnapshotModel';
import { WeatherData } from '../domain/types';

export const weatherSnapshotRepository = {
  async findLatest(locationId: string): Promise<WeatherSnapshotDocument | null> {
    return WeatherSnapshotModel.findOne({ locationId }).sort({ fetchedAt: -1 }).exec();
  },

  async create(locationId: string, data: WeatherData): Promise<WeatherSnapshotDocument> {
    return WeatherSnapshotModel.create({
      locationId,
      provider: 'openweathermap',
      current: data.current,
      forecast: data.forecast,
      fetchedAt: new Date(),
    });
  },
};
