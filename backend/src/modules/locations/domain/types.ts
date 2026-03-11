export interface LocationEntity {
  id: string;
  userId: string;
  cityName: string;
  countryCode: string;
  lat: number;
  lon: number;
  displayName: string;
  sortOrder: number;
  isCurrentLocation: boolean;
  createdAt: Date;
  updatedAt: Date;
}
