import { CurrentWeather, ForecastDay } from '../domain/types';

export interface WeatherResponseDto {
  current: CurrentWeather;
  forecast: ForecastDay[];
}
