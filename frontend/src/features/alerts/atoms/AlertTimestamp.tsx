import styles from './AlertTimestamp.module.css';

interface AlertTimestampProps {
  dateStr: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AlertTimestamp({ dateStr }: AlertTimestampProps) {
  return (
    <time className={styles.time} dateTime={dateStr} title={new Date(dateStr).toLocaleString()}>
      {relativeTime(dateStr)}
    </time>
  );
}
