export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  iconCode: string;
  iconUrl: string;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  description: string;
  iconCode: string;
  iconUrl: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export const FRESHNESS_TTL_MS = 10 * 60 * 1000; // 10 minutes
