'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateRule } from '../api/rulesApi';
import type { UpdateRuleRequest } from '../types';

export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRuleRequest }) => updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}
