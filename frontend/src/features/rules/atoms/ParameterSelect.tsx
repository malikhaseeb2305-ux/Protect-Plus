'use client';

import type { WeatherParameter } from '../types';
import styles from './Select.module.css';

const OPTIONS: { value: WeatherParameter; label: string }[] = [
  { value: 'temperature', label: 'Temperature' },
  { value: 'humidity', label: 'Humidity' },
  { value: 'windSpeed', label: 'Wind Speed' },
];

interface ParameterSelectProps {
  value: WeatherParameter;
  onChange: (value: WeatherParameter) => void;
}

export default function ParameterSelect({ value, onChange }: ParameterSelectProps) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value as WeatherParameter)}
      aria-label="Weather parameter"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
