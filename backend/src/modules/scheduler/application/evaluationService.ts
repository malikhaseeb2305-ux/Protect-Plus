import { logger } from '../../../shared/logger';

import { alertEventBus } from '../../alerts/infrastructure/alertEventBus';
import { alertNotificationRepository } from '../../alerts/infrastructure/alertNotificationRepository';
import { locationRepository } from '../../locations/infrastructure/locationRepository';
import { evaluateRule, isCooldownActive } from '../../rules/domain/ruleEvaluator';
import { AlertRuleEntity } from '../../rules/domain/types';
import { AlertRuleDocument } from '../../rules/infrastructure/alertRuleModel';
import { alertRuleRepository } from '../../rules/infrastructure/alertRuleRepository';
import { weatherService } from '../../weather/application/weatherService';
import { CurrentWeather } from '../../weather/domain/types';

const OPERATOR_LABELS: Record<string, string> = {
  '<': 'drops below',
  '>': 'exceeds',
  '<=': 'is at or below',
  '>=': 'is at or above',
};

const PARAMETER_LABELS: Record<string, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  windSpeed: 'Wind speed',
};

function buildAlertMessage(
  rule: AlertRuleEntity,
  actual: number,
  locationName: string,
): string {
  const param = PARAMETER_LABELS[rule.parameter] || rule.parameter;
  const op = OPERATOR_LABELS[rule.operator] || rule.operator;
  return `${param} ${op} ${rule.threshold} in ${locationName} (current: ${actual})`;
}

function toEntity(doc: AlertRuleDocument): AlertRuleEntity {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    locationId: String(doc.locationId),
    parameter: doc.parameter,
    operator: doc.operator,
    threshold: doc.threshold,
    active: doc.active,
    cooldownMinutes: doc.cooldownMinutes,
    lastEvaluatedAt: doc.lastEvaluatedAt,
    lastTriggeredAt: doc.lastTriggeredAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function extractValue(weather: CurrentWeather, parameter: string): number {
  switch (parameter) {
    case 'temperature':
      return weather.temperature;
    case 'humidity':
      return weather.humidity;
    case 'windSpeed':
      return weather.windSpeed;
    default:
      return 0;
  }
}

function groupByLocation(rules: AlertRuleDocument[]): Map<string, AlertRuleDocument[]> {
  const grouped = new Map<string, AlertRuleDocument[]>();
  for (const rule of rules) {
    const locId = String(rule.locationId);
    const group = grouped.get(locId) || [];
    group.push(rule);
    grouped.set(locId, group);
  }
  return grouped;
}

async function evaluateSingleRule(
  rule: AlertRuleEntity,
  weather: CurrentWeather,
  locationName: string,
  now: Date,
): Promise<boolean> {
  if (isCooldownActive(rule, now)) {
    await alertRuleRepository.updateEvaluationTimestamps(rule.id, now);
    return false;
  }

  const isTriggered = evaluateRule(rule, weather);
  if (!isTriggered) {
    await alertRuleRepository.updateEvaluationTimestamps(rule.id, now);
    return false;
  }

  const claimed = await alertRuleRepository.claimTrigger(rule.id, rule.cooldownMinutes, now);
  if (!claimed) {
    return false;
  }

  const actual = extractValue(weather, rule.parameter);
  const message = buildAlertMessage(rule, actual, locationName);

  const doc = await alertNotificationRepository.create({
    userId: rule.userId,
    locationId: rule.locationId,
    ruleId: rule.id,
    triggeredAt: now,
    message,
  });

  alertEventBus.publish(rule.userId, {
    id: String(doc._id),
    message,
    triggeredAt: now.toISOString(),
    locationId: rule.locationId,
    ruleId: rule.id,
  });

  logger.info('Alert triggered', {
    ruleId: rule.id,
    locationId: rule.locationId,
    message,
  });

  return true;
}

async function evaluateLocationGroup(
  locationId: string,
  rules: AlertRuleDocument[],
  now: Date,
): Promise<{ triggered: number; errors: number }> {
  const location = await locationRepository.findById(String(rules[0].userId), locationId);

  if (!location) {
    logger.warn('Location not found for rule evaluation, skipping group', { locationId });
    return { triggered: 0, errors: 0 };
  }

  const weatherData = await weatherService.getOrRefreshForScheduler(
    locationId,
    location.lat,
    location.lon,
  );

  let triggered = 0;
  let errors = 0;

  for (const ruleDoc of rules) {
    try {
      const wasTriggered = await evaluateSingleRule(
        toEntity(ruleDoc),
        weatherData.current,
        location.displayName,
        now,
      );
      if (wasTriggered) triggered++;
    } catch (err) {
      errors++;
      logger.error('Error evaluating rule', {
        ruleId: String(ruleDoc._id),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { triggered, errors };
}

let evaluating = false;

export const evaluationService = {
  async evaluateAllRules(): Promise<{ total: number; triggered: number; errors: number }> {
    if (evaluating) {
      logger.debug('Evaluation already in progress, skipping');
      return { total: 0, triggered: 0, errors: 0 };
    }

    evaluating = true;
    try {
      return await runEvaluation();
    } finally {
      evaluating = false;
    }
  },
};

async function runEvaluation(): Promise<{ total: number; triggered: number; errors: number }> {
    const now = new Date();
    let triggered = 0;
    let errors = 0;

    const activeRules = await alertRuleRepository.findAllActive();
    const total = activeRules.length;

    if (total === 0) {
      logger.debug('No active rules to evaluate');
      return { total: 0, triggered: 0, errors: 0 };
    }

    const rulesByLocation = groupByLocation(activeRules);

    for (const [locationId, rules] of rulesByLocation) {
      try {
        const result = await evaluateLocationGroup(locationId, rules, now);
        triggered += result.triggered;
        errors += result.errors;
      } catch (err) {
        errors++;
        logger.error('Error fetching weather for location group', {
          locationId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info('Rule evaluation cycle complete', { total, triggered, errors });
    return { total, triggered, errors };
}
