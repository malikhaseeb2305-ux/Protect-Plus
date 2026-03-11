import { locationService } from '../locationService';
import { locationRepository } from '../../infrastructure/locationRepository';

jest.mock('../../infrastructure/locationRepository');

const mockRepo = locationRepository as jest.Mocked<typeof locationRepository>;

const userId = '507f1f77bcf86cd799439011';

const fakeDoc = (overrides = {}) => ({
  _id: '607f1f77bcf86cd799439022',
  userId,
  cityName: 'London',
  countryCode: 'GB',
  lat: 51.5074,
  lon: -0.1278,
  displayName: 'London, GB',
  sortOrder: 0,
  isCurrentLocation: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('locationService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getUserLocations', () => {
    it('should return sorted locations mapped to entities', async () => {
      mockRepo.findByUser.mockResolvedValue([fakeDoc(), fakeDoc({ sortOrder: 1, cityName: 'Paris' })] as never);

      const result = await locationService.getUserLocations(userId);

      expect(mockRepo.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].cityName).toBe('London');
    });
  });

  describe('createLocation', () => {
    it('should create and return a location', async () => {
      mockRepo.countByUser.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(fakeDoc() as never);

      const result = await locationService.createLocation(userId, {
        cityName: 'London',
        countryCode: 'GB',
        lat: 51.5074,
        lon: -0.1278,
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          cityName: 'London',
          sortOrder: 0,
        }),
      );
      expect(result.id).toBe('607f1f77bcf86cd799439022');
    });

    it('should set sortOrder based on existing count', async () => {
      mockRepo.countByUser.mockResolvedValue(3);
      mockRepo.create.mockResolvedValue(fakeDoc({ sortOrder: 3 }) as never);

      await locationService.createLocation(userId, {
        cityName: 'Paris',
        countryCode: 'FR',
        lat: 48.8566,
        lon: 2.3522,
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: 3 }),
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete an existing location', async () => {
      mockRepo.delete.mockResolvedValue(fakeDoc() as never);

      await expect(locationService.deleteLocation(userId, '607f1f77bcf86cd799439022')).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith(userId, '607f1f77bcf86cd799439022');
    });

    it('should throw NotFoundError if location does not exist', async () => {
      mockRepo.delete.mockResolvedValue(null);

      await expect(locationService.deleteLocation(userId, 'nonexistent')).rejects.toThrow('Location not found');
    });
  });

  describe('reorderLocations', () => {
    it('should reorder when all IDs match', async () => {
      const docs = [
        fakeDoc({ _id: 'aaa' }),
        fakeDoc({ _id: 'bbb' }),
      ];
      mockRepo.findByUser.mockResolvedValueOnce(docs as never);
      mockRepo.reorder.mockResolvedValue(undefined);
      mockRepo.findByUser.mockResolvedValueOnce(
        [fakeDoc({ _id: 'bbb', sortOrder: 0 }), fakeDoc({ _id: 'aaa', sortOrder: 1 })] as never,
      );

      const result = await locationService.reorderLocations(userId, ['bbb', 'aaa']);

      expect(mockRepo.reorder).toHaveBeenCalledWith(userId, ['bbb', 'aaa']);
      expect(result).toHaveLength(2);
    });

    it('should throw if IDs do not match user locations', async () => {
      mockRepo.findByUser.mockResolvedValue([fakeDoc({ _id: 'aaa' })] as never);

      await expect(
        locationService.reorderLocations(userId, ['aaa', 'nonexistent']),
      ).rejects.toThrow('Provided IDs do not match user locations');
    });
  });

  describe('ownership enforcement', () => {
    it('should throw NotFoundError when updating another user\'s location', async () => {
      mockRepo.update.mockResolvedValue(null);

      await expect(
        locationService.updateLocation('other-user', '607f1f77bcf86cd799439022', { cityName: 'Hack' }),
      ).rejects.toThrow('Location not found');
    });
  });
});
