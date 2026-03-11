import { apiClient } from '@/lib/apiClient';
import type {
  LocationDto,
  CreateLocationRequest,
  UpdateLocationRequest,
  DetectLocationRequest,
} from '../types';

export async function fetchLocations(): Promise<LocationDto[]> {
  const res = await apiClient.get<{ locations: LocationDto[] }>('/locations');
  return res.data.locations;
}

export async function createLocation(data: CreateLocationRequest): Promise<LocationDto> {
  const res = await apiClient.post<{ location: LocationDto }>('/locations', data);
  return res.data.location;
}

export async function updateLocation(
  id: string,
  data: UpdateLocationRequest,
): Promise<LocationDto> {
  const res = await apiClient.put<{ location: LocationDto }>(`/locations/${id}`, data);
  return res.data.location;
}

export async function deleteLocation(id: string): Promise<void> {
  await apiClient.delete(`/locations/${id}`);
}

export async function reorderLocations(orderedIds: string[]): Promise<LocationDto[]> {
  const res = await apiClient.patch<{ locations: LocationDto[] }>('/locations/reorder', {
    orderedIds,
  });
  return res.data.locations;
}

export async function detectLocation(data: DetectLocationRequest): Promise<LocationDto> {
  const res = await apiClient.post<{ location: LocationDto }>('/locations/detect', data);
  return res.data.location;
}
