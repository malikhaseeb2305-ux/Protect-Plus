import { evaluateRule, isCooldownActive } from '../ruleEvaluator';
import { AlertRuleEntity } from '../types';
import { CurrentWeather } from '../../../weather/domain/types';

function makeRule(overrides: Partial<AlertRuleEntity> = {}): AlertRuleEntity {
  return {
    id: 'rule-1',
    userId: 'user-1',
    locationId: 'loc-1',
    parameter: 'temperature',
    operator: '>',
    threshold: 35,
    active: true,
    cooldownMinutes: 30,
    lastEvaluatedAt: null,
    lastTriggeredAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeWeather(overrides: Partial<CurrentWeather> = {}): CurrentWeather {
  return {
    temperature: 30,
    humidity: 60,
    windSpeed: 5,
    description: 'clear sky',
    iconCode: '01d',
    iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    ...overrides,
  };
}

describe('ruleEvaluator', () => {
  describe('evaluateRule', () => {
    describe('> operator', () => {
      it('should return true when value exceeds threshold', () => {
        const rule = makeRule({ operator: '>', threshold: 25 });
        expect(evaluateRule(rule, makeWeather({ temperature: 30 }))).toBe(true);
      });

      it('should return false when value equals threshold', () => {
        const rule = makeRule({ operator: '>', threshold: 30 });
        expect(evaluateRule(rule, makeWeather({ temperature: 30 }))).toBe(false);
      });

      it('should return false when value is below threshold', () => {
        const rule = makeRule({ operator: '>', threshold: 35 });
        expect(evaluateRule(rule, makeWeather({ temperature: 30 }))).toBe(false);
      });
    });

    describe('< operator', () => {
      it('should return true when value is below threshold', () => {
        const rule = makeRule({ parameter: 'humidity', operator: '<', threshold: 70 });
        expect(evaluateRule(rule, makeWeather({ humidity: 40 }))).toBe(true);
      });

      it('should return false when value equals threshold', () => {
        const rule = makeRule({ parameter: 'humidity', operator: '<', threshold: 60 });
        expect(evaluateRule(rule, makeWeather({ humidity: 60 }))).toBe(false);
      });

      it('should return false when value exceeds threshold', () => {
        const rule = makeRule({ parameter: 'humidity', operator: '<', threshold: 50 });
        expect(evaluateRule(rule, makeWeather({ humidity: 60 }))).toBe(false);
      });
    });

    describe('>= operator', () => {
      it('should return true when value exceeds threshold', () => {
        const rule = makeRule({ parameter: 'windSpeed', operator: '>=', threshold: 5 });
        expect(evaluateRule(rule, makeWeather({ windSpeed: 10 }))).toBe(true);
      });

      it('should return true when value equals threshold', () => {
        const rule = makeRule({ parameter: 'windSpeed', operator: '>=', threshold: 5 });
        expect(evaluateRule(rule, makeWeather({ windSpeed: 5 }))).toBe(true);
      });

      it('should return false when value is below threshold', () => {
        const rule = makeRule({ parameter: 'windSpeed', operator: '>=', threshold: 5 });
        expect(evaluateRule(rule, makeWeather({ windSpeed: 4 }))).toBe(false);
      });
    });

    describe('<= operator', () => {
      it('should return true when value is below threshold', () => {
        const rule = makeRule({ operator: '<=', threshold: 35 });
        expect(evaluateRule(rule, makeWeather({ temperature: 30 }))).toBe(true);
      });

      it('should return true when value equals threshold', () => {
        const rule = makeRule({ operator: '<=', threshold: 30 });
        expect(evaluateRule(rule, makeWeather({ temperature: 30 }))).toBe(true);
      });

      it('should return false when value exceeds threshold', () => {
        const rule = makeRule({ operator: '<=', threshold: 30 });
        expect(evaluateRule(rule, makeWeather({ temperature: 31 }))).toBe(false);
      });
    });

    describe('parameter extraction', () => {
      it('should evaluate temperature parameter', () => {
        const rule = makeRule({ parameter: 'temperature', operator: '>', threshold: 0 });
        expect(evaluateRule(rule, makeWeather({ temperature: 25 }))).toBe(true);
      });

      it('should evaluate humidity parameter', () => {
        const rule = makeRule({ parameter: 'humidity', operator: '>', threshold: 50 });
        expect(evaluateRule(rule, makeWeather({ humidity: 80 }))).toBe(true);
      });

      it('should evaluate windSpeed parameter', () => {
        const rule = makeRule({ parameter: 'windSpeed', operator: '>', threshold: 10 });
        expect(evaluateRule(rule, makeWeather({ windSpeed: 15 }))).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle zero threshold', () => {
        const rule = makeRule({ operator: '>', threshold: 0 });
        expect(evaluateRule(rule, makeWeather({ temperature: 1 }))).toBe(true);
        expect(evaluateRule(rule, makeWeather({ temperature: 0 }))).toBe(false);
        expect(evaluateRule(rule, makeWeather({ temperature: -1 }))).toBe(false);
      });

      it('should handle negative temperature', () => {
        const rule = makeRule({ operator: '<', threshold: 0 });
        expect(evaluateRule(rule, makeWeather({ temperature: -5 }))).toBe(true);
        expect(evaluateRule(rule, makeWeather({ temperature: 5 }))).toBe(false);
      });

      it('should handle very large threshold values', () => {
        const rule = makeRule({ operator: '>', threshold: 999999 });
        expect(evaluateRule(rule, makeWeather({ temperature: 30 }))).toBe(false);
      });

      it('should handle zero wind speed', () => {
        const rule = makeRule({ parameter: 'windSpeed', operator: '<=', threshold: 0 });
        expect(evaluateRule(rule, makeWeather({ windSpeed: 0 }))).toBe(true);
      });

      it('should handle 100% humidity boundary', () => {
        const rule = makeRule({ parameter: 'humidity', operator: '>=', threshold: 100 });
        expect(evaluateRule(rule, makeWeather({ humidity: 100 }))).toBe(true);
        expect(evaluateRule(rule, makeWeather({ humidity: 99 }))).toBe(false);
      });

      it('should handle decimal values correctly', () => {
        const rule = makeRule({ operator: '>', threshold: 7.5 });
        expect(evaluateRule(rule, makeWeather({ temperature: 7.6 }))).toBe(true);
        expect(evaluateRule(rule, makeWeather({ temperature: 7.5 }))).toBe(false);
        expect(evaluateRule(rule, makeWeather({ temperature: 7.4 }))).toBe(false);
      });
    });
  });

  describe('isCooldownActive', () => {
    it('should return false when rule has never triggered', () => {
      const rule = makeRule({ lastTriggeredAt: null });
      expect(isCooldownActive(rule)).toBe(false);
    });

    it('should return true when within cooldown window', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const rule = makeRule({ cooldownMinutes: 30, lastTriggeredAt: fiveMinutesAgo });
      expect(isCooldownActive(rule)).toBe(true);
    });

    it('should return false when cooldown has expired', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const rule = makeRule({ cooldownMinutes: 30, lastTriggeredAt: oneHourAgo });
      expect(isCooldownActive(rule)).toBe(false);
    });

    it('should return false when exactly at cooldown boundary', () => {
      const exactly30MinAgo = new Date(Date.now() - 30 * 60 * 1000);
      const rule = makeRule({ cooldownMinutes: 30, lastTriggeredAt: exactly30MinAgo });
      const now = new Date(exactly30MinAgo.getTime() + 30 * 60 * 1000);
      expect(isCooldownActive(rule, now)).toBe(false);
    });

    it('should return true one millisecond before cooldown expires', () => {
      const now = new Date('2025-06-15T12:30:00.000Z');
      const almostExpired = new Date('2025-06-15T12:00:00.001Z');
      const rule = makeRule({ cooldownMinutes: 30, lastTriggeredAt: almostExpired });
      expect(isCooldownActive(rule, now)).toBe(true);
    });

    it('should handle 1-minute cooldown', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      const rule = makeRule({ cooldownMinutes: 1, lastTriggeredAt: thirtySecondsAgo });
      expect(isCooldownActive(rule, now)).toBe(true);
    });

    it('should handle very long cooldown (24 hours)', () => {
      const now = new Date();
      const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
      const rule = makeRule({ cooldownMinutes: 1440, lastTriggeredAt: twentyThreeHoursAgo });
      expect(isCooldownActive(rule, now)).toBe(true);
    });

    it('should respect the explicit now parameter over system time', () => {
      const triggeredAt = new Date('2025-01-01T10:00:00Z');
      const rule = makeRule({ cooldownMinutes: 60, lastTriggeredAt: triggeredAt });

      const withinCooldown = new Date('2025-01-01T10:30:00Z');
      expect(isCooldownActive(rule, withinCooldown)).toBe(true);

      const afterCooldown = new Date('2025-01-01T11:30:00Z');
      expect(isCooldownActive(rule, afterCooldown)).toBe(false);
    });
  });
});
