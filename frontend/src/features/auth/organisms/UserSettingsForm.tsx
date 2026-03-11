'use client';

import { useState, useEffect } from 'react';

import Card from '@/shared/ui/atoms/Card';
import Button from '@/shared/ui/atoms/Button';
import { extractApiError } from '@/shared/lib/extractApiError';
import { useToast } from '@/providers/ToastProvider';

import { useCurrentUser } from '../hooks/useCurrentUser';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import styles from './UserSettingsForm.module.css';

type TempUnit = 'C' | 'F';

export default function UserSettingsForm() {
  const { data: user, isLoading } = useCurrentUser();
  const updateSettings = useUpdateSettings();
  const [unit, setUnit] = useState<TempUnit>('C');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (user?.preferences.temperatureUnit) {
      setUnit(user.preferences.temperatureUnit);
    }
  }, [user]);

  function handleSave() {
    setFeedback(null);
    updateSettings.mutate(
      { temperatureUnit: unit },
      {
        onSuccess: () => {
          setFeedback({ type: 'success', message: 'Settings saved.' });
          showToast('Settings saved', 'success');
        },
        onError: (err) => {
          const message = extractApiError(err);
          setFeedback({ type: 'error', message });
          showToast(message, 'error');
        },
      },
    );
  }

  if (isLoading) {
    return <p className={styles.loading}>Loading settings...</p>;
  }

  return (
    <Card>
      <h2 className={styles.heading}>Preferences</h2>

      <div className={styles.field}>
        <label className={styles.label}>Temperature Unit</label>
        <div className={styles.toggleGroup} role="radiogroup" aria-label="Temperature unit">
          <button
            type="button"
            role="radio"
            aria-checked={unit === 'C'}
            className={`${styles.toggleOption} ${unit === 'C' ? styles.toggleActive : ''}`}
            onClick={() => setUnit('C')}
          >
            Celsius (&deg;C)
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={unit === 'F'}
            className={`${styles.toggleOption} ${unit === 'F' ? styles.toggleActive : ''}`}
            onClick={() => setUnit('F')}
          >
            Fahrenheit (&deg;F)
          </button>
        </div>
      </div>

      {feedback && (
        <p
          className={feedback.type === 'success' ? styles.success : styles.error}
          role="status"
        >
          {feedback.message}
        </p>
      )}

      <Button onClick={handleSave} loading={updateSettings.isPending}>
        Save preferences
      </Button>
    </Card>
  );
}
