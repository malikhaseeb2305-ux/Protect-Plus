import { CurrentWeather, ForecastDay } from '../domain/types';
import { OWMCurrentResponse, OWMForecastResponse } from './openWeatherClient';

const ICON_BASE_URL = 'https://openweathermap.org/img/wn';

function buildIconUrl(iconCode: string): string {
  return `${ICON_BASE_URL}/${iconCode}@2x.png`;
}

export function mapCurrentWeather(raw: OWMCurrentResponse): CurrentWeather {
  const weather = raw.weather[0];
  return {
    temperature: raw.main.temp,
    humidity: raw.main.humidity,
    windSpeed: raw.wind.speed,
    description: weather?.description || '',
    iconCode: weather?.icon || '01d',
    iconUrl: buildIconUrl(weather?.icon || '01d'),
  };
}

/**
 * Aggregates 3-hour forecast intervals into daily highs/lows.
 * Groups by date (YYYY-MM-DD), takes max temp as high, min temp as low,
 * and picks the midday entry's icon/description as representative.
 */
export function mapForecastDays(raw: OWMForecastResponse): ForecastDay[] {
  const dayMap = new Map<
    string,
    {
      high: number;
      low: number;
      descriptions: { description: string; iconCode: string; hour: number }[];
    }
  >();

  for (const item of raw.list) {
    const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
    const hour = new Date(item.dt * 1000).getUTCHours();

    const existing = dayMap.get(date);
    const weather = item.weather[0];
    const entry = {
      description: weather?.description || '',
      iconCode: weather?.icon || '01d',
      hour,
    };

    if (existing) {
      existing.high = Math.max(existing.high, item.main.temp_max);
      existing.low = Math.min(existing.low, item.main.temp_min);
      existing.descriptions.push(entry);
    } else {
      dayMap.set(date, {
        high: item.main.temp_max,
        low: item.main.temp_min,
        descriptions: [entry],
      });
    }
  }

  const days: ForecastDay[] = [];

  for (const [date, data] of dayMap) {
    // Pick the entry closest to midday (12:00) as representative
    const representative = data.descriptions.reduce((best, curr) =>
      Math.abs(curr.hour - 12) < Math.abs(best.hour - 12) ? curr : best,
    );

    days.push({
      date,
      high: Math.round(data.high * 10) / 10,
      low: Math.round(data.low * 10) / 10,
      description: representative.description,
      iconCode: representative.iconCode,
      iconUrl: buildIconUrl(representative.iconCode),
    });
  }

  return days.slice(0, 5);
}
