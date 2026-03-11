'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reorderLocations } from '../api/locationsApi';
import { LOCATIONS_KEY } from './useLocations';

export function useReorderLocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderLocations(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
    },
  });
}
