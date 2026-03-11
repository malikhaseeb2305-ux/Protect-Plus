import styles from './RuleStatusBadge.module.css';

interface RuleStatusBadgeProps {
  active: boolean;
}

export default function RuleStatusBadge({ active }: RuleStatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${active ? styles.active : styles.inactive}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
