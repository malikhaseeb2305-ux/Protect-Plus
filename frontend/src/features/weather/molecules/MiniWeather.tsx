'use client';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import Skeleton from '@/shared/ui/atoms/Skeleton';

import { useWeather } from '../hooks/useWeather';
import WeatherIcon from '../atoms/WeatherIcon';
import TemperatureBadge from '../atoms/TemperatureBadge';
import styles from './MiniWeather.module.css';

interface MiniWeatherProps {
  locationId: string;
}

export default function MiniWeather({ locationId }: MiniWeatherProps) {
  const { data: weather, isLoading } = useWeather(locationId);
  const { data: user } = useCurrentUser();
  const unit = user?.preferences.temperatureUnit ?? 'C';

  if (isLoading) {
    return (
      <div className={styles.row}>
        <Skeleton width="32px" height="32px" borderRadius="var(--radius-sm)" />
        <Skeleton width="48px" height="16px" />
        <Skeleton width="80px" height="14px" />
      </div>
    );
  }

  if (!weather) {
    return <span className={styles.loading}>--</span>;
  }

  return (
    <div className={styles.row}>
      <WeatherIcon
        iconUrl={weather.current.iconUrl}
        description={weather.current.description}
        size="sm"
      />
      <TemperatureBadge value={weather.current.temperature} unit={unit} />
      <span className={styles.desc}>{weather.current.description}</span>
    </div>
  );
}
