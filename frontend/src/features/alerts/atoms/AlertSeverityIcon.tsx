import styles from './AlertSeverityIcon.module.css';

interface AlertSeverityIconProps {
  message: string;
}

export default function AlertSeverityIcon({ message }: AlertSeverityIconProps) {
  const isHigh = message.toLowerCase().includes('exceeds') || message.toLowerCase().includes('above');

  return (
    <span
      className={`${styles.icon} ${isHigh ? styles.high : styles.low}`}
      aria-hidden="true"
    >
      {isHigh ? '▲' : '▼'}
    </span>
  );
}
