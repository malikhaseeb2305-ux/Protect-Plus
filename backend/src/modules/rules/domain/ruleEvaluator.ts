import { CurrentWeather } from '../../weather/domain/types';
import { AlertRuleEntity, WeatherParameter, ComparisonOperator } from './types';

function extractValue(weather: CurrentWeather, parameter: WeatherParameter): number {
  switch (parameter) {
    case 'temperature':
      return weather.temperature;
    case 'humidity':
      return weather.humidity;
    case 'windSpeed':
      return weather.windSpeed;
  }
}

function compare(actual: number, operator: ComparisonOperator, threshold: number): boolean {
  switch (operator) {
    case '<':
      return actual < threshold;
    case '>':
      return actual > threshold;
    case '<=':
      return actual <= threshold;
    case '>=':
      return actual >= threshold;
  }
}

export function evaluateRule(rule: AlertRuleEntity, weather: CurrentWeather): boolean {
  const actual = extractValue(weather, rule.parameter);
  return compare(actual, rule.operator, rule.threshold);
}

export function isCooldownActive(rule: AlertRuleEntity, now: Date = new Date()): boolean {
  if (!rule.lastTriggeredAt) {
    return false;
  }
  const elapsed = now.getTime() - rule.lastTriggeredAt.getTime();
  const cooldownMs = rule.cooldownMinutes * 60 * 1000;
  return elapsed < cooldownMs;
}
