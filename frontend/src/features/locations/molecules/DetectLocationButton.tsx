'use client';

import { useEffect } from 'react';

import Button from '@/shared/ui/atoms/Button';
import { extractApiError } from '@/shared/lib/extractApiError';
import { useToast } from '@/providers/ToastProvider';

import { useDetectLocation } from '../hooks/useDetectLocation';
import styles from './DetectLocationButton.module.css';

export default function DetectLocationButton() {
  const detect = useDetectLocation();
  const { showToast } = useToast();

  useEffect(() => {
    if (!detect.error) return;
    const message = extractApiError(detect.error);
    if (!message) return;
    showToast(message, 'error');
  }, [detect.error, showToast]);

  return (
    <div className={styles.wrapper}>
      <Button
        variant="secondary"
        onClick={() => detect.mutate()}
        loading={detect.isPending}
      >
        Detect my location
      </Button>
      {detect.error && (() => {
        const message = extractApiError(detect.error);
        if (!message || message.includes('Location already exists for this city')) {
          return null;
        }
        return (
          <p className={styles.error} role="alert">
            {message}
          </p>
        );
      })()}
      {detect.isSuccess && (
        <p className={styles.success} role="status">
          Location detected: {detect.data.displayName}
        </p>
      )}
    </div>
  );
}
