'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createLocation } from '../api/locationsApi';
import { LOCATIONS_KEY } from './useLocations';
import type { CreateLocationRequest } from '../types';

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationRequest) => createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
    },
  });
}
