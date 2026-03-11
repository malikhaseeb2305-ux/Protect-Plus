export interface CurrentWeatherDto {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  iconCode: string;
  iconUrl: string;
}

export interface ForecastDayDto {
  date: string;
  high: number;
  low: number;
  description: string;
  iconCode: string;
  iconUrl: string;
}

export interface WeatherDto {
  current: CurrentWeatherDto;
  forecast: ForecastDayDto[];
}
