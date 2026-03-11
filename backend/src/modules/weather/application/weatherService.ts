import { NotFoundError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import { locationRepository } from '../../locations/infrastructure/locationRepository';
import { weatherSnapshotRepository } from '../infrastructure/weatherSnapshotRepository';
import { openWeatherClient } from '../infrastructure/openWeatherClient';
import { mapCurrentWeather, mapForecastDays } from '../infrastructure/weatherMapper';
import { WeatherData, FRESHNESS_TTL_MS } from '../domain/types';

function isStale(fetchedAt: Date): boolean {
  return Date.now() - fetchedAt.getTime() > FRESHNESS_TTL_MS;
}

export const weatherService = {
  async getWeather(userId: string, locationId: string): Promise<WeatherData> {
    const location = await locationRepository.findById(userId, locationId);
    if (!location) {
      throw new NotFoundError('Location');
    }

    const latest = await weatherSnapshotRepository.findLatest(locationId);

    if (latest && !isStale(latest.fetchedAt)) {
      logger.debug('Returning cached weather snapshot', {
        locationId,
        age: Date.now() - latest.fetchedAt.getTime(),
      });
      return {
        current: latest.current,
        forecast: latest.forecast,
      };
    }

    return this.refreshSnapshot(locationId, location.lat, location.lon);
  },

  async refreshSnapshot(
    locationId: string,
    lat: number,
    lon: number,
  ): Promise<WeatherData> {
    logger.info('Fetching fresh weather data from OpenWeatherMap', { locationId, lat, lon });

    const [rawCurrent, rawForecast] = await Promise.all([
      openWeatherClient.fetchCurrentWeather(lat, lon),
      openWeatherClient.fetchForecast(lat, lon),
    ]);

    const current = mapCurrentWeather(rawCurrent);
    const forecast = mapForecastDays(rawForecast);
    const data: WeatherData = { current, forecast };

    await weatherSnapshotRepository.create(locationId, data);

    return data;
  },

  /**
   * Used by the scheduler — fetches weather by locationId without user ownership check.
   */
  async getOrRefreshForScheduler(
    locationId: string,
    lat: number,
    lon: number,
  ): Promise<WeatherData> {
    const latest = await weatherSnapshotRepository.findLatest(locationId);

    if (latest && !isStale(latest.fetchedAt)) {
      return {
        current: latest.current,
        forecast: latest.forecast,
      };
    }

    return this.refreshSnapshot(locationId, lat, lon);
  },
};
