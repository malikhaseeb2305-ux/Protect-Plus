export interface LocationDto {
  id: string;
  cityName: string;
  countryCode: string;
  lat: number;
  lon: number;
  displayName: string;
  sortOrder: number;
  isCurrentLocation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationRequest {
  cityName: string;
  countryCode: string;
  lat: number;
  lon: number;
  displayName?: string;
  isCurrentLocation?: boolean;
}

export interface UpdateLocationRequest {
  cityName?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  displayName?: string;
}

export interface ReorderRequest {
  orderedIds: string[];
}

export interface DetectLocationRequest {
  lat?: number;
  lon?: number;
}
