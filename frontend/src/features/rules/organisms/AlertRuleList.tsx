'use client';

import Card from '@/shared/ui/atoms/Card';
import Spinner from '@/shared/ui/atoms/Spinner';

import { useRules } from '../hooks/useRules';
import AlertRuleRow from '../molecules/AlertRuleRow';
import AlertRuleForm from '../molecules/AlertRuleForm';
import styles from './AlertRuleList.module.css';

interface AlertRuleListProps {
  locationId: string;
}

export default function AlertRuleList({ locationId }: AlertRuleListProps) {
  const { data: rules, isLoading, error } = useRules(locationId);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Alert Rules</h2>

      {isLoading && (
        <div className={styles.center}>
          <Spinner />
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          Failed to load alert rules.
        </p>
      )}

      {rules && rules.length === 0 && (
        <p className={styles.empty}>No alert rules configured for this location.</p>
      )}

      {rules && rules.length > 0 && (
        <div className={styles.list}>
          {rules.map((rule) => (
            <AlertRuleRow key={rule.id} rule={rule} />
          ))}
        </div>
      )}

      <Card>
        <AlertRuleForm locationId={locationId} />
      </Card>
    </section>
  );
}
