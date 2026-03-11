'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchUnreadCount } from '../api/alertsApi';

export const UNREAD_COUNT_KEY = ['alerts', 'unreadCount'] as const;

export function useUnreadAlertCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
  });
}
