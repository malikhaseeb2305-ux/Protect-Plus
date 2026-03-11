'use client';

import { useState, useRef, useEffect } from 'react';

import { useUnreadAlertCount } from '@/features/alerts/hooks/useUnreadAlertCount';
import { useAlerts } from '@/features/alerts/hooks/useAlerts';
import { useMarkAlertRead } from '@/features/alerts/hooks/useMarkAlertRead';
import { useMarkAllAlertsRead } from '@/features/alerts/hooks/useMarkAllAlertsRead';
import AlertTimestamp from '@/features/alerts/atoms/AlertTimestamp';
import { useToast } from '@/providers/ToastProvider';

import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unreadCount = 0 } = useUnreadAlertCount();
  const { data: alerts } = useAlerts(1, 5);
  const markRead = useMarkAlertRead();
  const markAll = useMarkAllAlertsRead();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.bellButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                className={styles.markAllButton}
                onClick={() => markAll.mutate(undefined, {
                  onError: () => showToast('Failed to mark alerts as read', 'error'),
                })}
                disabled={markAll.isPending}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.dropdownList}>
            {(!alerts || alerts.length === 0) && (
              <p className={styles.empty}>No recent alerts.</p>
            )}
            {alerts?.map((alert) => (
              <button
                key={alert.id}
                className={`${styles.alertItem} ${alert.read ? styles.alertRead : styles.alertUnread}`}
                onClick={() => {
                  if (!alert.read) markRead.mutate(alert.id, {
                    onError: () => showToast('Failed to mark alert as read', 'error'),
                  });
                }}
                role="menuitem"
              >
                <span className={styles.alertMessage}>
                  {alert.message}
                </span>
                <span className={styles.alertMeta}>
                  <AlertTimestamp dateStr={alert.triggeredAt} />
                  {!alert.read && <span className={styles.unreadDot} />}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
