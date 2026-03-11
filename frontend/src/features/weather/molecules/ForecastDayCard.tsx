import WeatherIcon from '../atoms/WeatherIcon';
import type { ForecastDayDto } from '../types';
import styles from './ForecastDayCard.module.css';

interface ForecastDayCardProps {
  day: ForecastDayDto;
  unit: 'C' | 'F';
}

function convertTemp(value: number, unit: 'C' | 'F'): number {
  return unit === 'F' ? Math.round(value * 9 / 5 + 32) : Math.round(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ForecastDayCard({ day, unit }: ForecastDayCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.date}>{formatDate(day.date)}</span>
      <WeatherIcon iconUrl={day.iconUrl} description={day.description} size="sm" />
      <div className={styles.temps}>
        <span className={styles.high}>{convertTemp(day.high, unit)}&deg;</span>
        <span className={styles.low}>{convertTemp(day.low, unit)}&deg;</span>
      </div>
      <span className={styles.desc}>{day.description}</span>
    </div>
  );
}
