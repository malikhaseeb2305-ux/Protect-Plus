'use client';

import { useToast } from '@/providers/ToastProvider';

import AlertSeverityIcon from '../atoms/AlertSeverityIcon';
import AlertTimestamp from '../atoms/AlertTimestamp';
import { useMarkAlertRead } from '../hooks/useMarkAlertRead';
import type { AlertNotificationDto } from '../types';
import styles from './AlertListItem.module.css';

interface AlertListItemProps {
  alert: AlertNotificationDto;
}

export default function AlertListItem({ alert }: AlertListItemProps) {
  const markRead = useMarkAlertRead();
  const { showToast } = useToast();

  function handleMarkRead() {
    markRead.mutate(alert.id, {
      onError: () => showToast('Failed to mark alert as read', 'error'),
    });
  }

  return (
    <div className={`${styles.item} ${alert.read ? styles.read : styles.unread}`}>
      <AlertSeverityIcon message={alert.message} />
      <div className={styles.body}>
        <p className={styles.message}>{alert.message}</p>
        <AlertTimestamp dateStr={alert.triggeredAt} />
      </div>
      {!alert.read && (
        <button
          className={styles.markButton}
          onClick={handleMarkRead}
          disabled={markRead.isPending}
          aria-label="Mark as read"
        >
          ✓
        </button>
      )}
    </div>
  );
}
