'use client';

import type { ComparisonOperator } from '../types';
import styles from './Select.module.css';

const OPTIONS: { value: ComparisonOperator; label: string }[] = [
  { value: '>', label: '> greater than' },
  { value: '<', label: '< less than' },
  { value: '>=', label: '>= at or above' },
  { value: '<=', label: '<= at or below' },
];

interface OperatorSelectProps {
  value: ComparisonOperator;
  onChange: (value: ComparisonOperator) => void;
}

export default function OperatorSelect({ value, onChange }: OperatorSelectProps) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value as ComparisonOperator)}
      aria-label="Comparison operator"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
