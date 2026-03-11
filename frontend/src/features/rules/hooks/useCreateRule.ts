'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createRule } from '../api/rulesApi';
import { rulesKey } from './useRules';
import type { CreateRuleRequest } from '../types';

export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRuleRequest) => createRule(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rulesKey(variables.locationId) });
      queryClient.invalidateQueries({ queryKey: rulesKey() });
    },
  });
}
