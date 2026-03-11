'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchWeather } from '../api/weatherApi';

export function weatherKey(locationId: string) {
  return ['weather', locationId] as const;
}

export function useWeather(locationId: string) {
  return useQuery({
    queryKey: weatherKey(locationId),
    queryFn: () => fetchWeather(locationId),
    staleTime: 5 * 60 * 1000,
  });
}
