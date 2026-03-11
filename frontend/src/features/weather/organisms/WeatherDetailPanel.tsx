'use client';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import Card from '@/shared/ui/atoms/Card';
import Skeleton from '@/shared/ui/atoms/Skeleton';

import { useWeather } from '../hooks/useWeather';
import CurrentConditions from '../molecules/CurrentConditions';
import ForecastPanel from './ForecastPanel';
import TemperatureTrendChart from './TemperatureTrendChart';
import styles from './WeatherDetailPanel.module.css';

interface WeatherDetailPanelProps {
  locationId: string;
}

export default function WeatherDetailPanel({ locationId }: WeatherDetailPanelProps) {
  const { data: weather, isLoading, error } = useWeather(locationId);
  const { data: user } = useCurrentUser();
  const unit = user?.preferences.temperatureUnit ?? 'C';

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <Card>
          <Skeleton width="140px" height="20px" />
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            <Skeleton width="64px" height="64px" borderRadius="var(--radius-md)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <Skeleton width="80px" height="32px" />
              <Skeleton width="120px" height="16px" />
            </div>
          </div>
        </Card>
        <Card>
          <Skeleton width="120px" height="18px" />
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="100px" height="120px" borderRadius="var(--radius-md)" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <Card>
        <p className={styles.error}>Failed to load weather data.</p>
      </Card>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Card>
        <h2 className={styles.heading}>Current Weather</h2>
        <CurrentConditions current={weather.current} unit={unit} />
      </Card>

      <Card>
        <ForecastPanel forecast={weather.forecast} unit={unit} />
      </Card>

      <TemperatureTrendChart forecast={weather.forecast} unit={unit} />
    </div>
  );
}
