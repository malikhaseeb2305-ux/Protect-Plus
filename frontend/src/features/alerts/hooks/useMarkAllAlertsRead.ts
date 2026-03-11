'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllAlertsRead } from '../api/alertsApi';
import { ALERTS_KEY } from './useAlerts';
import { UNREAD_COUNT_KEY } from './useUnreadAlertCount';

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAlertsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}
