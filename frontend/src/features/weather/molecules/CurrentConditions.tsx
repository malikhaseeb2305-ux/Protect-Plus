'use client';

import WeatherIcon from '../atoms/WeatherIcon';
import TemperatureBadge from '../atoms/TemperatureBadge';
import MetricBadge from '../atoms/MetricBadge';
import type { CurrentWeatherDto } from '../types';
import styles from './CurrentConditions.module.css';

interface CurrentConditionsProps {
  current: CurrentWeatherDto;
  unit: 'C' | 'F';
}

export default function CurrentConditions({ current, unit }: CurrentConditionsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <WeatherIcon
          iconUrl={current.iconUrl}
          description={current.description}
          size="lg"
        />
        <div className={styles.tempBlock}>
          <TemperatureBadge value={current.temperature} unit={unit} size="lg" />
          <p className={styles.desc}>{current.description}</p>
        </div>
      </div>
      <div className={styles.metrics}>
        <MetricBadge label="Humidity" value={Math.round(current.humidity)} unit="%" />
        <MetricBadge label="Wind" value={current.windSpeed.toFixed(1)} unit=" m/s" />
      </div>
    </div>
  );
}
