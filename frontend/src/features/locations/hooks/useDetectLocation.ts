'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { detectLocation } from '../api/locationsApi';
import { LOCATIONS_KEY } from './useLocations';

function getBrowserCoords(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5_000 },
    );
  });
}

export function useDetectLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const coords = await getBrowserCoords();
      return detectLocation(coords ?? {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
    },
  });
}
