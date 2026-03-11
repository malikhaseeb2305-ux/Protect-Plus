export type TemperatureUnit = 'C' | 'F';

export interface UserPreferences {
  temperatureUnit: TemperatureUnit;
}

export interface UserEntity {
  id: string;
  email: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
