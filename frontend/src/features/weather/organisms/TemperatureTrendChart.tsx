'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import Card from '@/shared/ui/atoms/Card';

import type { ForecastDayDto } from '../types';
import styles from './TemperatureTrendChart.module.css';

interface TemperatureTrendChartProps {
  forecast: ForecastDayDto[];
  unit: 'C' | 'F';
}

function convert(value: number, unit: 'C' | 'F'): number {
  return unit === 'F' ? Math.round(value * 9 / 5 + 32) : Math.round(value);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TemperatureTrendChart({ forecast, unit }: TemperatureTrendChartProps) {
  if (forecast.length === 0) return null;

  const data = forecast.map((day) => ({
    name: formatDate(day.date),
    high: convert(day.high, unit),
    low: convert(day.low, unit),
  }));

  const unitLabel = unit === 'F' ? '°F' : '°C';

  return (
    <Card>
      <h3 className={styles.heading}>Temperature Trend</h3>
      <div className={styles.chartWrapper} role="img" aria-label="Temperature trend chart showing high and low temperatures over the next 5 days">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              unit={unitLabel}
              width={50}
            />
            <Tooltip
              contentStyle={{
                fontSize: '0.8125rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
              }}
              formatter={(value, name) => [
                `${value}${unitLabel}`,
                name === 'high' ? 'High' : 'Low',
              ]}
            />
            <Legend
              verticalAlign="top"
              height={32}
              formatter={(value: string) => (value === 'high' ? 'High' : 'Low')}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#highGradient)"
              dot={{ r: 4, fill: '#ef4444' }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#lowGradient)"
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
