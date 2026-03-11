import { Request, Response } from 'express';

import { logger } from '../../../shared/logger';
import { validateOrThrow } from '../../../shared/utils/validateOrThrow';
import { openWeatherClient } from '../../weather/infrastructure/openWeatherClient';

import { locationService } from '../application/locationService';
import { LocationEntity } from '../domain/types';
import { geolocateByIp } from '../infrastructure/ipGeolocationClient';
import {
  CreateLocationSchema,
  UpdateLocationSchema,
  ReorderLocationsSchema,
  DetectLocationSchema,
  LocationResponseDto,
} from './dtos';

function mapToDto(entity: LocationEntity): LocationResponseDto {
  return {
    id: entity.id,
    cityName: entity.cityName,
    countryCode: entity.countryCode,
    lat: entity.lat,
    lon: entity.lon,
    displayName: entity.displayName,
    sortOrder: entity.sortOrder,
    isCurrentLocation: entity.isCurrentLocation,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

function getUserId(req: Request): string {
  return (req as Request & { user: { userId: string } }).user.userId;
}

function getParamId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export const locationController = {
  async list(req: Request, res: Response) {
    const locations = await locationService.getUserLocations(getUserId(req));
    res.json({ locations: locations.map(mapToDto) });
  },

  async create(req: Request, res: Response) {
    const data = validateOrThrow(CreateLocationSchema.safeParse(req.body));
    const location = await locationService.createLocation(getUserId(req), data);
    res.status(201).json({ location: mapToDto(location) });
  },

  async update(req: Request, res: Response) {
    const data = validateOrThrow(UpdateLocationSchema.safeParse(req.body));
    const location = await locationService.updateLocation(getUserId(req), getParamId(req), data);
    res.json({ location: mapToDto(location) });
  },

  async remove(req: Request, res: Response) {
    await locationService.deleteLocation(getUserId(req), getParamId(req));
    res.json({ message: 'Location deleted' });
  },

  async reorder(req: Request, res: Response) {
    const { orderedIds } = validateOrThrow(ReorderLocationsSchema.safeParse(req.body));
    const locations = await locationService.reorderLocations(getUserId(req), orderedIds);
    res.json({ locations: locations.map(mapToDto) });
  },

  async detect(req: Request, res: Response) {
    const body = validateOrThrow(DetectLocationSchema.safeParse(req.body));

    let lat = body.lat;
    let lon = body.lon;
    let cityName = 'Unknown';
    let countryCode = 'XX';

    if (lat !== undefined && lon !== undefined) {
      try {
        const geo = await openWeatherClient.reverseGeocode(lat, lon);
        if (geo) {
          cityName = geo.name;
          countryCode = geo.country;
        }
      } catch (err) {
        logger.warn('Reverse geocoding failed, will try IP fallback', {
          lat,
          lon,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (cityName === 'Unknown') {
      try {
        const clientIp = req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || '127.0.0.1';
        const ipGeo = await geolocateByIp(clientIp);
        cityName = ipGeo.city;
        countryCode = ipGeo.countryCode;
        if (lat === undefined || lon === undefined) {
          lat = ipGeo.lat;
          lon = ipGeo.lon;
        }
      } catch (err) {
        logger.warn('IP geolocation also failed', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (lat === undefined || lon === undefined) {
      res.status(422).json({
        status: 'error',
        message: 'Could not determine your location. Please add a location manually.',
      });
      return;
    }

    const location = await locationService.detectCurrentLocation(getUserId(req), lat, lon, {
      cityName,
      countryCode,
    });
    res.status(201).json({ location: mapToDto(location) });
  },
};
