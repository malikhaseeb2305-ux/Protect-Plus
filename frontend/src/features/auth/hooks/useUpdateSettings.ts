'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateUserSettings } from '../api/settingsApi';
import { CURRENT_USER_KEY } from './useCurrentUser';
import type { UpdateSettingsRequest } from '../types';

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => updateUserSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
    },
  });
}
