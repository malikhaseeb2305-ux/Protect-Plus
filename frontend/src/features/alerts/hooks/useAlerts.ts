'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAlerts } from '../api/alertsApi';

export const ALERTS_KEY = ['alerts'] as const;

export function useAlerts(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...ALERTS_KEY, page, limit] as const,
    queryFn: () => fetchAlerts(page, limit),
  });
}
