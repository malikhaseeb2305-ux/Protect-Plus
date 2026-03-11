'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRule } from '../api/rulesApi';

export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}
