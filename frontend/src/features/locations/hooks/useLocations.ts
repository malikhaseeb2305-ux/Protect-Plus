'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchLocations } from '../api/locationsApi';

export const LOCATIONS_KEY = ['locations'] as const;

export function useLocations() {
  return useQuery({
    queryKey: LOCATIONS_KEY,
    queryFn: fetchLocations,
  });
}
