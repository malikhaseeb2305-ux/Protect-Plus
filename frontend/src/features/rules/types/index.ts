export type WeatherParameter = 'temperature' | 'humidity' | 'windSpeed';
export type ComparisonOperator = '<' | '>' | '<=' | '>=';

export interface AlertRuleDto {
  id: string;
  locationId: string;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: number;
  active: boolean;
  cooldownMinutes: number;
  lastEvaluatedAt: string | null;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export interface CreateRuleRequest {
  locationId: string;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: number;
  cooldownMinutes?: number;
}

export interface UpdateRuleRequest {
  parameter?: WeatherParameter;
  operator?: ComparisonOperator;
  threshold?: number;
  cooldownMinutes?: number;
  active?: boolean;
}
