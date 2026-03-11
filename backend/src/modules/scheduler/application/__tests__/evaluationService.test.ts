import { evaluationService } from '../evaluationService';
import { alertRuleRepository } from '../../../rules/infrastructure/alertRuleRepository';
import { alertNotificationRepository } from '../../../alerts/infrastructure/alertNotificationRepository';
import { weatherService } from '../../../weather/application/weatherService';
import { locationRepository } from '../../../locations/infrastructure/locationRepository';

jest.mock('../../../rules/infrastructure/alertRuleRepository');
jest.mock('../../../alerts/infrastructure/alertNotificationRepository');
jest.mock('../../../weather/application/weatherService');
jest.mock('../../../locations/infrastructure/locationRepository');

const mockedRuleRepo = alertRuleRepository as jest.Mocked<typeof alertRuleRepository>;
const mockedNotifRepo = alertNotificationRepository as jest.Mocked<typeof alertNotificationRepository>;
const mockedWeatherService = weatherService as jest.Mocked<typeof weatherService>;
const mockedLocationRepo = locationRepository as jest.Mocked<typeof locationRepository>;

function makeRuleDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'rule-1',
    userId: 'user-1',
    locationId: 'loc-1',
    parameter: 'temperature',
    operator: '>',
    threshold: 35,
    active: true,
    cooldownMinutes: 30,
    lastEvaluatedAt: null,
    lastTriggeredAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  } as any;
}

function makeLocation(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'loc-1',
    userId: 'user-1',
    cityName: 'London',
    countryCode: 'GB',
    lat: 51.5,
    lon: -0.12,
    displayName: 'London, GB',
    sortOrder: 0,
    isCurrentLocation: false,
    ...overrides,
  } as any;
}

function makeWeatherData(overrides: Record<string, unknown> = {}) {
  return {
    current: {
      temperature: 40,
      humidity: 60,
      windSpeed: 5,
      description: 'clear sky',
      iconCode: '01d',
      iconUrl: 'https://example.com/01d.png',
      ...overrides,
    },
    forecast: [] as any[],
  };
}

function setupDefaultMocks() {
  mockedRuleRepo.updateEvaluationTimestamps.mockResolvedValue();
  mockedRuleRepo.claimTrigger.mockResolvedValue(true);
  mockedNotifRepo.create.mockResolvedValue({} as any);
}

describe('evaluationService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('no rules', () => {
    it('should return zeros when no active rules exist', async () => {
      mockedRuleRepo.findAllActive.mockResolvedValue([]);
      const result = await evaluationService.evaluateAllRules();
      expect(result).toEqual({ total: 0, triggered: 0, errors: 0 });
    });

    it('should not fetch any weather data when no rules exist', async () => {
      mockedRuleRepo.findAllActive.mockResolvedValue([]);
      await evaluationService.evaluateAllRules();
      expect(mockedWeatherService.getOrRefreshForScheduler).not.toHaveBeenCalled();
    });
  });

  describe('triggering alerts', () => {
    it('should trigger alert when rule condition is met', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc()]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      const result = await evaluationService.evaluateAllRules();

      expect(result.triggered).toBe(1);
      expect(mockedNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          locationId: 'loc-1',
          ruleId: 'rule-1',
          message: expect.stringContaining('exceeds'),
        }),
      );
    });

    it('should include actual value in alert message', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc({ threshold: 30 })]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ temperature: 42 }));

      await evaluationService.evaluateAllRules();

      expect(mockedNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('current: 42'),
        }),
      );
    });

    it('should include location name in alert message', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc()]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation({ displayName: 'Tokyo, JP' }));
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      await evaluationService.evaluateAllRules();

      expect(mockedNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Tokyo, JP'),
        }),
      );
    });

    it('should trigger for humidity rules', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([
        makeRuleDoc({ parameter: 'humidity', operator: '>', threshold: 50 }),
      ]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ humidity: 90 }));

      const result = await evaluationService.evaluateAllRules();
      expect(result.triggered).toBe(1);
    });

    it('should trigger for windSpeed rules', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([
        makeRuleDoc({ parameter: 'windSpeed', operator: '>=', threshold: 5 }),
      ]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ windSpeed: 10 }));

      const result = await evaluationService.evaluateAllRules();
      expect(result.triggered).toBe(1);
    });
  });

  describe('not triggering', () => {
    it('should not trigger alert when condition is not met', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc({ threshold: 50 })]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ temperature: 40 }));

      const result = await evaluationService.evaluateAllRules();

      expect(result.triggered).toBe(0);
      expect(mockedNotifRepo.create).not.toHaveBeenCalled();
    });

    it('should still update evaluation timestamp when rule does not trigger', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc({ threshold: 50 })]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ temperature: 40 }));

      await evaluationService.evaluateAllRules();

      expect(mockedRuleRepo.updateEvaluationTimestamps).toHaveBeenCalledWith(
        'rule-1',
        expect.any(Date),
      );
    });
  });

  describe('cooldown behavior', () => {
    it('should skip rule when cooldown is active', async () => {
      setupDefaultMocks();
      const ruleDoc = makeRuleDoc({
        lastTriggeredAt: new Date(Date.now() - 5 * 60 * 1000),
        cooldownMinutes: 30,
      });
      mockedRuleRepo.findAllActive.mockResolvedValue([ruleDoc]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      const result = await evaluationService.evaluateAllRules();

      expect(result.triggered).toBe(0);
      expect(mockedNotifRepo.create).not.toHaveBeenCalled();
      expect(mockedRuleRepo.claimTrigger).not.toHaveBeenCalled();
    });

    it('should evaluate rule when cooldown has expired', async () => {
      setupDefaultMocks();
      const ruleDoc = makeRuleDoc({
        lastTriggeredAt: new Date(Date.now() - 60 * 60 * 1000),
        cooldownMinutes: 30,
      });
      mockedRuleRepo.findAllActive.mockResolvedValue([ruleDoc]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      const result = await evaluationService.evaluateAllRules();
      expect(result.triggered).toBe(1);
    });

    it('should not create notification when claimTrigger returns false (concurrent protection)', async () => {
      setupDefaultMocks();
      mockedRuleRepo.claimTrigger.mockResolvedValue(false);
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc()]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      const result = await evaluationService.evaluateAllRules();

      expect(result.triggered).toBe(0);
      expect(mockedNotifRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('location grouping', () => {
    it('should batch weather fetches per location', async () => {
      setupDefaultMocks();
      const rule1 = makeRuleDoc({ _id: 'rule-1', parameter: 'temperature', operator: '>', threshold: 35 });
      const rule2 = makeRuleDoc({ _id: 'rule-2', parameter: 'humidity', operator: '>', threshold: 80 });

      mockedRuleRepo.findAllActive.mockResolvedValue([rule1, rule2]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      await evaluationService.evaluateAllRules();

      expect(mockedWeatherService.getOrRefreshForScheduler).toHaveBeenCalledTimes(1);
    });

    it('should fetch weather separately for different locations', async () => {
      setupDefaultMocks();
      const rule1 = makeRuleDoc({ _id: 'rule-1', locationId: 'loc-1' });
      const rule2 = makeRuleDoc({ _id: 'rule-2', locationId: 'loc-2', userId: 'user-2' });

      mockedRuleRepo.findAllActive.mockResolvedValue([rule1, rule2]);
      mockedLocationRepo.findById.mockImplementation(async (_userId: string, locId: string) => {
        if (locId === 'loc-1') return makeLocation();
        return makeLocation({ _id: 'loc-2', userId: 'user-2', displayName: 'Paris, FR' });
      });
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      await evaluationService.evaluateAllRules();

      expect(mockedWeatherService.getOrRefreshForScheduler).toHaveBeenCalledTimes(2);
    });

    it('should skip location group when location is not found', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc()]);
      mockedLocationRepo.findById.mockResolvedValue(null);

      const result = await evaluationService.evaluateAllRules();

      expect(result.triggered).toBe(0);
      expect(result.errors).toBe(0);
      expect(mockedWeatherService.getOrRefreshForScheduler).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should count errors when weather fetch fails but continue other locations', async () => {
      setupDefaultMocks();
      const rule1 = makeRuleDoc({ _id: 'rule-1', locationId: 'loc-1' });
      const rule2 = makeRuleDoc({ _id: 'rule-2', locationId: 'loc-2', userId: 'user-2' });

      mockedRuleRepo.findAllActive.mockResolvedValue([rule1, rule2]);
      mockedLocationRepo.findById.mockImplementation(async (_userId: string, locId: string) => {
        if (locId === 'loc-1') return makeLocation();
        return makeLocation({ _id: 'loc-2', userId: 'user-2', displayName: 'Paris, FR' });
      });
      mockedWeatherService.getOrRefreshForScheduler.mockImplementation(async (locId: string) => {
        if (locId === 'loc-1') throw new Error('API failure');
        return makeWeatherData();
      });

      const result = await evaluationService.evaluateAllRules();

      expect(result.errors).toBe(1);
      expect(result.triggered).toBe(1);
    });

    it('should count error when individual rule evaluation throws', async () => {
      setupDefaultMocks();
      mockedRuleRepo.claimTrigger.mockRejectedValueOnce(new Error('DB write error'));

      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc()]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      const result = await evaluationService.evaluateAllRules();

      expect(result.errors).toBe(1);
      expect(result.triggered).toBe(0);
    });

    it('should not crash when notification creation fails', async () => {
      setupDefaultMocks();
      mockedNotifRepo.create.mockRejectedValueOnce(new Error('DB write failed'));

      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc()]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData());

      const result = await evaluationService.evaluateAllRules();

      expect(result.errors).toBe(1);
    });

    it('should process all locations even when first location errors', async () => {
      setupDefaultMocks();
      const rule1 = makeRuleDoc({ _id: 'rule-1', locationId: 'loc-1' });
      const rule2 = makeRuleDoc({ _id: 'rule-2', locationId: 'loc-2', userId: 'user-1' });
      const rule3 = makeRuleDoc({ _id: 'rule-3', locationId: 'loc-3', userId: 'user-1' });

      mockedRuleRepo.findAllActive.mockResolvedValue([rule1, rule2, rule3]);
      mockedLocationRepo.findById.mockImplementation(async (_userId: string, locId: string) => {
        return makeLocation({ _id: locId, displayName: `City-${locId}` });
      });
      mockedWeatherService.getOrRefreshForScheduler.mockImplementation(async (locId: string) => {
        if (locId === 'loc-1') throw new Error('timeout');
        return makeWeatherData();
      });

      const result = await evaluationService.evaluateAllRules();

      expect(result.total).toBe(3);
      expect(result.errors).toBe(1);
      expect(result.triggered).toBe(2);
    });
  });

  describe('mixed rules per location', () => {
    it('should trigger some rules and skip others in the same location', async () => {
      setupDefaultMocks();
      const tempRule = makeRuleDoc({
        _id: 'rule-1',
        parameter: 'temperature',
        operator: '>',
        threshold: 35,
      });
      const humidityRule = makeRuleDoc({
        _id: 'rule-2',
        parameter: 'humidity',
        operator: '>',
        threshold: 80,
      });

      mockedRuleRepo.findAllActive.mockResolvedValue([tempRule, humidityRule]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(
        makeWeatherData({ temperature: 40, humidity: 50 }),
      );

      const result = await evaluationService.evaluateAllRules();

      expect(result.total).toBe(2);
      expect(result.triggered).toBe(1);
      expect(mockedNotifRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should trigger multiple rules in the same location when all conditions are met', async () => {
      setupDefaultMocks();
      const tempRule = makeRuleDoc({
        _id: 'rule-1',
        parameter: 'temperature',
        operator: '>',
        threshold: 35,
      });
      const humidityRule = makeRuleDoc({
        _id: 'rule-2',
        parameter: 'humidity',
        operator: '>',
        threshold: 50,
      });

      mockedRuleRepo.findAllActive.mockResolvedValue([tempRule, humidityRule]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(
        makeWeatherData({ temperature: 40, humidity: 80 }),
      );

      const result = await evaluationService.evaluateAllRules();

      expect(result.total).toBe(2);
      expect(result.triggered).toBe(2);
      expect(mockedNotifRepo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('alert message formatting', () => {
    it('should format "drops below" for < operator', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([
        makeRuleDoc({ parameter: 'temperature', operator: '<', threshold: 0 }),
      ]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ temperature: -5 }));

      await evaluationService.evaluateAllRules();

      expect(mockedNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Temperature drops below 0 in London, GB (current: -5)',
        }),
      );
    });

    it('should format "exceeds" for > operator', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([makeRuleDoc({ threshold: 30 })]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ temperature: 40 }));

      await evaluationService.evaluateAllRules();

      expect(mockedNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Temperature exceeds 30 in London, GB (current: 40)',
        }),
      );
    });

    it('should format "is at or above" for >= operator', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([
        makeRuleDoc({ parameter: 'humidity', operator: '>=', threshold: 90 }),
      ]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ humidity: 95 }));

      await evaluationService.evaluateAllRules();

      expect(mockedNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Humidity is at or above 90 in London, GB (current: 95)',
        }),
      );
    });

    it('should format "is at or below" for <= operator', async () => {
      setupDefaultMocks();
      mockedRuleRepo.findAllActive.mockResolvedValue([
        makeRuleDoc({ parameter: 'windSpeed', operator: '<=', threshold: 2 }),
      ]);
      mockedLocationRepo.findById.mockResolvedValue(makeLocation());
      mockedWeatherService.getOrRefreshForScheduler.mockResolvedValue(makeWeatherData({ windSpeed: 1 }));

      await evaluationService.evaluateAllRules();

      expect(mockedNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Wind speed is at or below 2 in London, GB (current: 1)',
        }),
      );
    });
  });
});
