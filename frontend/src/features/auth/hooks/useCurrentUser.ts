'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchCurrentUser } from '../api/authApi';

export const CURRENT_USER_KEY = ['currentUser'] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
