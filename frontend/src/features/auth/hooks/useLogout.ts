'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logoutUser } from '../api/authApi';
import { CURRENT_USER_KEY } from './useCurrentUser';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
      window.location.href = '/login';
    },
  });
}
