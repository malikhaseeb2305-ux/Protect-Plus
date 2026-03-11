'use client';

import ForecastDayCard from '../molecules/ForecastDayCard';
import type { ForecastDayDto } from '../types';
import styles from './ForecastPanel.module.css';

interface ForecastPanelProps {
  forecast: ForecastDayDto[];
  unit: 'C' | 'F';
}

export default function ForecastPanel({ forecast, unit }: ForecastPanelProps) {
  if (forecast.length === 0) {
    return <p className={styles.empty}>No forecast data available.</p>;
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.heading}>5-Day Forecast</h3>
      <div className={styles.row}>
        {forecast.map((day) => (
          <ForecastDayCard key={day.date} day={day} unit={unit} />
        ))}
      </div>
    </div>
  );
}
