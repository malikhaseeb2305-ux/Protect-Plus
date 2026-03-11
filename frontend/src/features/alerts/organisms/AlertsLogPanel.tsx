'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/providers/ToastProvider';
import Button from '@/shared/ui/atoms/Button';
import Card from '@/shared/ui/atoms/Card';
import Spinner from '@/shared/ui/atoms/Spinner';

import { ALERTS_KEY, useAlerts } from '../hooks/useAlerts';
import { useMarkAllAlertsRead } from '../hooks/useMarkAllAlertsRead';
import AlertListItem from '../molecules/AlertListItem';
import styles from './AlertsLogPanel.module.css';

const PAGE_SIZE = 10;

export default function AlertsLogPanel() {
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: alerts, isLoading, error } = useAlerts(page, PAGE_SIZE);
  const markAll = useMarkAllAlertsRead();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  function handleMarkAllRead() {
    markAll.mutate(undefined, {
      onError: () => showToast('Failed to mark alerts as read', 'error'),
    });
  }

  async function handleRefresh() {
    try {
      setIsRefreshing(true);
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === ALERTS_KEY[0];
        },
      });
      showToast('Alerts refreshed', 'success');
    } catch {
      showToast('Failed to refresh alerts', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Alert History</h2>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.refreshButton} ${isRefreshing ? styles.refreshButtonSpinning : ''}`}
            onClick={handleRefresh}
            aria-label="Refresh alerts"
            disabled={isRefreshing}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M21 12a9 9 0 1 1-2.64-6.36"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="21 3 21 9 15 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Button
            variant="ghost"
            onClick={handleMarkAllRead}
            loading={markAll.isPending}
          >
            Mark all read
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className={styles.center}>
          <Spinner />
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          Failed to load alerts.
        </p>
      )}

      {alerts && alerts.length === 0 && (
        <p className={styles.empty}>No alerts yet.</p>
      )}

      {alerts && alerts.length > 0 && (
        <Card className={styles.listCard}>
          <div className={styles.list}>
            {alerts.map((a) => (
              <AlertListItem key={a.id} alert={a} />
            ))}
          </div>
        </Card>
      )}

      {alerts && alerts.length >= PAGE_SIZE && (
        <div className={styles.pagination}>
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className={styles.pageInfo}>Page {page}</span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
