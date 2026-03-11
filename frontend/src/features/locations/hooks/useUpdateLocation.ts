'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateLocation } from '../api/locationsApi';
import { LOCATIONS_KEY } from './useLocations';
import type { UpdateLocationRequest } from '../types';

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
    },
  });
}
