import { NotFoundError, DomainError } from '../../../shared/errors';
import { locationRepository } from '../infrastructure/locationRepository';
import { LocationEntity } from '../domain/types';
import { LocationDocument } from '../infrastructure/locationModel';

function toEntity(doc: LocationDocument): LocationEntity {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    cityName: doc.cityName,
    countryCode: doc.countryCode,
    lat: doc.lat,
    lon: doc.lon,
    displayName: doc.displayName,
    sortOrder: doc.sortOrder,
    isCurrentLocation: doc.isCurrentLocation,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const locationService = {
  async getUserLocations(userId: string): Promise<LocationEntity[]> {
    const docs = await locationRepository.findByUser(userId);
    return docs.map(toEntity);
  },

  async getLocationById(userId: string, locationId: string): Promise<LocationEntity> {
    const doc = await locationRepository.findById(userId, locationId);
    if (!doc) {
      throw new NotFoundError('Location');
    }
    return toEntity(doc);
  },

  async createLocation(
    userId: string,
    payload: {
      cityName: string;
      countryCode: string;
      lat: number;
      lon: number;
      displayName?: string;
      isCurrentLocation?: boolean;
    },
  ): Promise<LocationEntity> {
    const existing = await locationRepository.findByUserAndCity(
      userId,
      payload.cityName,
      payload.countryCode,
    );

    if (existing) {
      throw new DomainError('Location already exists for this city');
    }

    const count = await locationRepository.countByUser(userId);

    const doc = await locationRepository.create({
      userId,
      cityName: payload.cityName,
      countryCode: payload.countryCode,
      lat: payload.lat,
      lon: payload.lon,
      displayName: payload.displayName || `${payload.cityName}, ${payload.countryCode}`,
      sortOrder: count,
      isCurrentLocation: payload.isCurrentLocation || false,
    });

    return toEntity(doc);
  },

  async updateLocation(
    userId: string,
    locationId: string,
    payload: Partial<{
      cityName: string;
      countryCode: string;
      lat: number;
      lon: number;
      displayName: string;
    }>,
  ): Promise<LocationEntity> {
    const doc = await locationRepository.update(userId, locationId, payload);
    if (!doc) {
      throw new NotFoundError('Location');
    }
    return toEntity(doc);
  },

  async deleteLocation(userId: string, locationId: string): Promise<void> {
    const doc = await locationRepository.delete(userId, locationId);
    if (!doc) {
      throw new NotFoundError('Location');
    }
  },

  async reorderLocations(userId: string, orderedIds: string[]): Promise<LocationEntity[]> {
    const existing = await locationRepository.findByUser(userId);
    const existingIds = new Set(existing.map((d) => String(d._id)));

    const allBelong = orderedIds.every((id) => existingIds.has(id));
    if (!allBelong || orderedIds.length !== existingIds.size) {
      throw new DomainError('Provided IDs do not match user locations');
    }

    await locationRepository.reorder(userId, orderedIds);

    return this.getUserLocations(userId);
  },

  async detectCurrentLocation(
    userId: string,
    lat: number,
    lon: number,
    resolvedCity: { cityName: string; countryCode: string },
  ): Promise<LocationEntity> {
    return this.createLocation(userId, {
      cityName: resolvedCity.cityName,
      countryCode: resolvedCity.countryCode,
      lat,
      lon,
      displayName: `${resolvedCity.cityName}, ${resolvedCity.countryCode}`,
      isCurrentLocation: true,
    });
  },
};
