import LocationsGrid from '@/features/locations/organisms/LocationsGrid';
import DashboardChart from '@/features/dashboard/organisms/DashboardChart';
import AlertsLogPanel from '@/features/alerts/organisms/AlertsLogPanel';

import styles from './page.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <LocationsGrid />
      <DashboardChart />
      <AlertsLogPanel />
    </div>
  );
}
