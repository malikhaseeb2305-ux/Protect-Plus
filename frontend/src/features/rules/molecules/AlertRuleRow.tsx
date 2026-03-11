'use client';

import Button from '@/shared/ui/atoms/Button';
import { useToast } from '@/providers/ToastProvider';

import RuleStatusBadge from '../atoms/RuleStatusBadge';
import { useUpdateRule } from '../hooks/useUpdateRule';
import { useDeleteRule } from '../hooks/useDeleteRule';
import type { AlertRuleDto } from '../types';
import styles from './AlertRuleRow.module.css';

const PARAM_LABELS: Record<string, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  windSpeed: 'Wind Speed',
};

interface AlertRuleRowProps {
  rule: AlertRuleDto;
}

export default function AlertRuleRow({ rule }: AlertRuleRowProps) {
  const updateMutation = useUpdateRule();
  const deleteMutation = useDeleteRule();
  const { showToast } = useToast();

  function toggleActive() {
    updateMutation.mutate(
      { id: rule.id, data: { active: !rule.active } },
      {
        onSuccess: () => showToast(`Rule ${rule.active ? 'disabled' : 'enabled'}`, 'success'),
        onError: () => showToast('Failed to update rule', 'error'),
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(rule.id, {
      onSuccess: () => showToast('Rule deleted', 'success'),
      onError: () => showToast('Failed to delete rule', 'error'),
    });
  }

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.condition}>
          {PARAM_LABELS[rule.parameter] || rule.parameter}{' '}
          <strong>{rule.operator}</strong>{' '}
          {rule.threshold}
        </span>
        <span className={styles.meta}>
          Cooldown: {rule.cooldownMinutes}m
          {rule.lastTriggeredAt && (
            <> &middot; Last triggered: {new Date(rule.lastTriggeredAt).toLocaleDateString()}</>
          )}
        </span>
      </div>
      <div className={styles.actions}>
        <RuleStatusBadge active={rule.active} />
        <Button
          variant="ghost"
          onClick={toggleActive}
          loading={updateMutation.isPending}
        >
          {rule.active ? 'Disable' : 'Enable'}
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          loading={deleteMutation.isPending}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
