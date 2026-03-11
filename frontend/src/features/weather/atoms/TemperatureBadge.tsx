import styles from './TemperatureBadge.module.css';

interface TemperatureBadgeProps {
  value: number;
  unit?: 'C' | 'F';
  size?: 'sm' | 'lg';
}

export default function TemperatureBadge({ value, unit = 'C', size = 'sm' }: TemperatureBadgeProps) {
  const display = unit === 'F' ? Math.round(value * 9 / 5 + 32) : Math.round(value);

  return (
    <span className={`${styles.badge} ${styles[size]}`}>
      {display}&deg;{unit}
    </span>
  );
}
