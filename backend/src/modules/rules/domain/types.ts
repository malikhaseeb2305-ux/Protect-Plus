export type WeatherParameter = 'temperature' | 'humidity' | 'windSpeed';

export type ComparisonOperator = '<' | '>' | '<=' | '>=';

export interface AlertRuleEntity {
  id: string;
  userId: string;
  locationId: string;
  parameter: WeatherParameter;
  operator: ComparisonOperator;
  threshold: number;
  active: boolean;
  cooldownMinutes: number;
  lastEvaluatedAt: Date | null;
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
