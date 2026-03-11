import styles from './MetricBadge.module.css';

interface MetricBadgeProps {
  label: string;
  value: string | number;
  unit: string;
}

export default function MetricBadge({ label, value, unit }: MetricBadgeProps) {
  return (
    <div className={styles.badge}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {value}
        {unit}
      </span>
    </div>
  );
}
