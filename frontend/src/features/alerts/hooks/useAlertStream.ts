'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/providers/ToastProvider';

import { ALERTS_KEY } from './useAlerts';
import { UNREAD_COUNT_KEY } from './useUnreadAlertCount';

const SSE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/alerts/stream`;

/**
 * Opens a Server-Sent Events connection to receive real-time alert
 * notifications. On each event it:
 *  1. Invalidates the React Query alert caches so the bell updates instantly
 *  2. Shows a toast so the user is aware without checking the bell
 *
 * Reconnects automatically with exponential back-off (max 30s).
 * Only one connection per mount; cleans up on unmount.
 */
export function useAlertStream(): void {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1_000;
    let unmounted = false;

    function connect() {
      if (unmounted) return;

      es = new EventSource(SSE_URL, { withCredentials: true });

      es.onopen = () => {
        retryDelay = 1_000;
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { message: string };

          queryClient.invalidateQueries({ queryKey: [...UNREAD_COUNT_KEY] });
          queryClient.invalidateQueries({
            predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === ALERTS_KEY[0],
          });

          showToastRef.current(data.message, 'info');
        } catch {
          // malformed frame — ignore
        }
      };

      es.onerror = () => {
        es?.close();
        if (unmounted) return;
        retryTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30_000);
          connect();
        }, retryDelay);
      };
    }

    connect();

    return () => {
      unmounted = true;
      es?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [queryClient]);
}
