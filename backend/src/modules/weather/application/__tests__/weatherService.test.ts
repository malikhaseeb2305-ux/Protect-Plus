import { weatherService } from '../weatherService';
import { weatherSnapshotRepository } from '../../infrastructure/weatherSnapshotRepository';
import { openWeatherClient } from '../../infrastructure/openWeatherClient';
import { locationRepository } from '../../../locations/infrastructure/locationRepository';
import { FRESHNESS_TTL_MS } from '../../domain/types';

jest.mock('../../infrastructure/weatherSnapshotRepository');
jest.mock('../../infrastructure/openWeatherClient');
jest.mock('../../../locations/infrastructure/locationRepository');

const mockSnapshotRepo = weatherSnapshotRepository as jest.Mocked<typeof weatherSnapshotRepository>;
const mockOwmClient = openWeatherClient as jest.Mocked<typeof openWeatherClient>;
const mockLocationRepo = locationRepository as jest.Mocked<typeof locationRepository>;

const userId = 'user-1';
const locationId = 'loc-1';

const fakeLocation = {
  _id: locationId,
  userId,
  lat: 51.5074,
  lon: -0.1278,
} as never;

const fakeCurrentResponse = {
  main: { temp: 12.5, humidity: 72 },
  wind: { speed: 5.3 },
  weather: [{ description: 'overcast clouds', icon: '04d' }],
};

const fakeForecastResponse = {
  list: [
    {
      dt: 1700000000,
      dt_txt: '2024-11-14 12:00:00',
      main: { temp: 13, temp_min: 10, temp_max: 15 },
      weather: [{ description: 'light rain', icon: '10d' }],
    },
    {
      dt: 1700010800,
      dt_txt: '2024-11-14 15:00:00',
      main: { temp: 11, temp_min: 9, temp_max: 14 },
      weather: [{ description: 'clouds', icon: '04d' }],
    },
    {
      dt: 1700086400,
      dt_txt: '2024-11-15 12:00:00',
      main: { temp: 8, temp_min: 5, temp_max: 10 },
      weather: [{ description: 'clear sky', icon: '01d' }],
    },
  ],
};

const freshSnapshot = {
  locationId,
  current: {
    temperature: 12.5,
    humidity: 72,
    windSpeed: 5.3,
    description: 'overcast clouds',
    iconCode: '04d',
    iconUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
  },
  forecast: [],
  fetchedAt: new Date(), // fresh
};

const staleSnapshot = {
  ...freshSnapshot,
  fetchedAt: new Date(Date.now() - FRESHNESS_TTL_MS - 1000), // stale
};

describe('weatherService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getWeather', () => {
    it('should return cached snapshot when fresh', async () => {
      mockLocationRepo.findById.mockResolvedValue(fakeLocation);
      mockSnapshotRepo.findLatest.mockResolvedValue(freshSnapshot as never);

      const result = await weatherService.getWeather(userId, locationId);

      expect(result.current.temperature).toBe(12.5);
      expect(mockOwmClient.fetchCurrentWeather).not.toHaveBeenCalled();
    });

    it('should fetch from API when snapshot is stale', async () => {
      mockLocationRepo.findById.mockResolvedValue(fakeLocation);
      mockSnapshotRepo.findLatest.mockResolvedValue(staleSnapshot as never);
      mockOwmClient.fetchCurrentWeather.mockResolvedValue(fakeCurrentResponse);
      mockOwmClient.fetchForecast.mockResolvedValue(fakeForecastResponse);
      mockSnapshotRepo.create.mockResolvedValue({} as never);

      const result = await weatherService.getWeather(userId, locationId);

      expect(mockOwmClient.fetchCurrentWeather).toHaveBeenCalledWith(51.5074, -0.1278);
      expect(mockOwmClient.fetchForecast).toHaveBeenCalledWith(51.5074, -0.1278);
      expect(mockSnapshotRepo.create).toHaveBeenCalled();
      expect(result.current.temperature).toBe(12.5);
    });

    it('should fetch from API when no snapshot exists', async () => {
      mockLocationRepo.findById.mockResolvedValue(fakeLocation);
      mockSnapshotRepo.findLatest.mockResolvedValue(null);
      mockOwmClient.fetchCurrentWeather.mockResolvedValue(fakeCurrentResponse);
      mockOwmClient.fetchForecast.mockResolvedValue(fakeForecastResponse);
      mockSnapshotRepo.create.mockResolvedValue({} as never);

      const result = await weatherService.getWeather(userId, locationId);

      expect(mockOwmClient.fetchCurrentWeather).toHaveBeenCalled();
      expect(result.current.description).toBe('overcast clouds');
    });

    it('should throw NotFoundError for non-existent location', async () => {
      mockLocationRepo.findById.mockResolvedValue(null);

      await expect(weatherService.getWeather(userId, 'bad-id')).rejects.toThrow('Location not found');
    });
  });
});
