import UserSettingsForm from '@/features/auth/organisms/UserSettingsForm';

import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>
      <UserSettingsForm />
    </div>
  );
}
