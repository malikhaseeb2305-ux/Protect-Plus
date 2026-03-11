'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteLocation } from '../api/locationsApi';
import { LOCATIONS_KEY } from './useLocations';

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
    },
  });
}
