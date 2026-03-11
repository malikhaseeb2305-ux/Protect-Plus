import { apiClient } from '@/lib/apiClient';
import type { WeatherDto } from '../types';

export async function fetchWeather(locationId: string): Promise<WeatherDto> {
  const res = await apiClient.get<WeatherDto>(`/weather/${locationId}`);
  return res.data;
}
