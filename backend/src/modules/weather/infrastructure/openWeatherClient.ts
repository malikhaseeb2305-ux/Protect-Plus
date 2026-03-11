import { config } from '../../../shared/config';
import { logger } from '../../../shared/logger';
import { DomainError } from '../../../shared/errors';

const BASE_URL = 'https://api.openweathermap.org';

interface OWMCurrentResponse {
  main: { temp: number; humidity: number };
  wind: { speed: number };
  weather: { description: string; icon: string }[];
}

interface OWMForecastItem {
  dt: number;
  dt_txt: string;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: { description: string; icon: string }[];
}

interface OWMForecastResponse {
  list: OWMForecastItem[];
}

interface OWMGeoResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

async function owmFetch<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    logger.error('OpenWeatherMap API error', {
      status: response.status,
      url: url.replace(config.openWeatherApiKey, '***'),
      body,
    });
    throw new DomainError(`Weather service unavailable (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const openWeatherClient = {
  async fetchCurrentWeather(lat: number, lon: number): Promise<OWMCurrentResponse> {
    const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${config.openWeatherApiKey}`;
    return owmFetch<OWMCurrentResponse>(url);
  },

  async fetchForecast(lat: number, lon: number): Promise<OWMForecastResponse> {
    const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${config.openWeatherApiKey}`;
    return owmFetch<OWMForecastResponse>(url);
  },

  async reverseGeocode(lat: number, lon: number): Promise<OWMGeoResult | null> {
    const url = `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${config.openWeatherApiKey}`;
    const results = await owmFetch<OWMGeoResult[]>(url);
    return results.length > 0 ? results[0] : null;
  },
};

export type { OWMCurrentResponse, OWMForecastResponse, OWMForecastItem, OWMGeoResult };
