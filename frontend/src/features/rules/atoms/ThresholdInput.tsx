'use client';

import styles from './ThresholdInput.module.css';

interface ThresholdInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ThresholdInput({ value, onChange }: ThresholdInputProps) {
  return (
    <input
      type="number"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      step="any"
      aria-label="Threshold value"
    />
  );
}
