'use client';

import { FormEvent, useState } from 'react';

import Button from '@/shared/ui/atoms/Button';
import { useToast } from '@/providers/ToastProvider';
import { extractApiError } from '@/shared/lib/extractApiError';

import ParameterSelect from '../atoms/ParameterSelect';
import OperatorSelect from '../atoms/OperatorSelect';
import ThresholdInput from '../atoms/ThresholdInput';
import { useCreateRule } from '../hooks/useCreateRule';
import type { WeatherParameter, ComparisonOperator } from '../types';
import styles from './AlertRuleForm.module.css';

interface AlertRuleFormProps {
  locationId: string;
}

export default function AlertRuleForm({ locationId }: AlertRuleFormProps) {
  const [parameter, setParameter] = useState<WeatherParameter>('temperature');
  const [operator, setOperator] = useState<ComparisonOperator>('>');
  const [threshold, setThreshold] = useState(30);
  const [cooldown, setCooldown] = useState(30);
  const create = useCreateRule();
  const { showToast } = useToast();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate(
      { locationId, parameter, operator, threshold, cooldownMinutes: cooldown },
      {
        onSuccess: () => {
          setParameter('temperature');
          setOperator('>');
          setThreshold(30);
          setCooldown(30);
          showToast('Alert rule created', 'success');
        },
        onError: (err) => showToast(extractApiError(err), 'error'),
      },
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h4 className={styles.heading}>New Alert Rule</h4>
      <div className={styles.row}>
        <ParameterSelect value={parameter} onChange={setParameter} />
        <OperatorSelect value={operator} onChange={setOperator} />
        <ThresholdInput value={threshold} onChange={setThreshold} />
      </div>
      <div className={styles.cooldownRow}>
        <label className={styles.label} htmlFor="cooldown">
          Cooldown (min, min 5)
        </label>
        <input
          id="cooldown"
          type="number"
          className={styles.cooldownInput}
          value={cooldown}
          onChange={(e) => setCooldown(Number(e.target.value))}
          min={5}
        />
      </div>

      {create.error && (
        <p className={styles.error} role="alert">
          {extractApiError(create.error)}
        </p>
      )}

      <Button type="submit" loading={create.isPending}>
        Add rule
      </Button>
    </form>
  );
}
