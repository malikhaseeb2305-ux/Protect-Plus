'use client';

import { useLocations } from '@/features/locations/hooks/useLocations';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import TemperatureTrendChart from '@/features/weather/organisms/TemperatureTrendChart';

import styles from './DashboardChart.module.css';

export default function DashboardChart() {
  const { data: locations } = useLocations();
  const { data: user } = useCurrentUser();
  const unit = user?.preferences.temperatureUnit ?? 'C';

  const primaryLocation = locations?.[0];
  const { data: weather } = useWeather(primaryLocation?.id ?? '');

  if (!primaryLocation || !weather || weather.forecast.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <p className={styles.label}>Forecast for {primaryLocation.displayName}</p>
      <TemperatureTrendChart forecast={weather.forecast} unit={unit} />
    </section>
  );
}
