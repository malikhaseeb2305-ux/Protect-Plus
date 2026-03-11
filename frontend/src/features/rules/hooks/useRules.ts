'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchRules } from '../api/rulesApi';

export function rulesKey(locationId?: string) {
  return locationId ? ['rules', locationId] as const : ['rules'] as const;
}

export function useRules(locationId?: string) {
  return useQuery({
    queryKey: rulesKey(locationId),
    queryFn: () => fetchRules(locationId),
  });
}
