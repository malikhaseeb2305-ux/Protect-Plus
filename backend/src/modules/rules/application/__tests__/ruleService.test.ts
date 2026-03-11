import { ruleService } from '../ruleService';
import { alertRuleRepository } from '../../infrastructure/alertRuleRepository';
import { NotFoundError } from '../../../../shared/errors';

jest.mock('../../infrastructure/alertRuleRepository');

const mockedRepo = alertRuleRepository as jest.Mocked<typeof alertRuleRepository>;

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

describe('ruleService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getRules', () => {
    it('should return mapped rule entities', async () => {
      mockedRepo.findByUser.mockResolvedValue([makeRuleDoc()]);
      const rules = await ruleService.getRules('user-1');
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('rule-1');
      expect(rules[0].parameter).toBe('temperature');
    });

    it('should return empty array when user has no rules', async () => {
      mockedRepo.findByUser.mockResolvedValue([]);
      const rules = await ruleService.getRules('user-1');
      expect(rules).toEqual([]);
    });

    it('should forward locationId filter', async () => {
      mockedRepo.findByUser.mockResolvedValue([]);
      await ruleService.getRules('user-1', 'loc-1');
      expect(mockedRepo.findByUser).toHaveBeenCalledWith('user-1', 'loc-1');
    });

    it('should call repository without locationId when not provided', async () => {
      mockedRepo.findByUser.mockResolvedValue([]);
      await ruleService.getRules('user-1');
      expect(mockedRepo.findByUser).toHaveBeenCalledWith('user-1', undefined);
    });

    it('should return multiple rules for the same location', async () => {
      const rule1 = makeRuleDoc({ _id: 'rule-1', parameter: 'temperature' });
      const rule2 = makeRuleDoc({ _id: 'rule-2', parameter: 'humidity' });
      mockedRepo.findByUser.mockResolvedValue([rule1, rule2]);

      const rules = await ruleService.getRules('user-1');
      expect(rules).toHaveLength(2);
      expect(rules[0].parameter).toBe('temperature');
      expect(rules[1].parameter).toBe('humidity');
    });
  });

  describe('createRule', () => {
    it('should create and return rule entity', async () => {
      mockedRepo.create.mockResolvedValue(makeRuleDoc());
      const rule = await ruleService.createRule('user-1', {
        locationId: 'loc-1',
        parameter: 'temperature',
        operator: '>',
        threshold: 35,
      });
      expect(rule.id).toBe('rule-1');
      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          locationId: 'loc-1',
          cooldownMinutes: 30,
          active: true,
        }),
      );
    });

    it('should default cooldownMinutes to 30 when not provided', async () => {
      mockedRepo.create.mockResolvedValue(makeRuleDoc());
      await ruleService.createRule('user-1', {
        locationId: 'loc-1',
        parameter: 'temperature',
        operator: '>',
        threshold: 35,
      });
      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cooldownMinutes: 30 }),
      );
    });

    it('should use custom cooldownMinutes when provided', async () => {
      mockedRepo.create.mockResolvedValue(makeRuleDoc({ cooldownMinutes: 60 }));
      await ruleService.createRule('user-1', {
        locationId: 'loc-1',
        parameter: 'temperature',
        operator: '>',
        threshold: 35,
        cooldownMinutes: 60,
      });
      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cooldownMinutes: 60 }),
      );
    });

    it('should always set active to true on creation', async () => {
      mockedRepo.create.mockResolvedValue(makeRuleDoc());
      await ruleService.createRule('user-1', {
        locationId: 'loc-1',
        parameter: 'humidity',
        operator: '<',
        threshold: 20,
      });
      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ active: true }),
      );
    });

    it('should pass all parameters correctly', async () => {
      mockedRepo.create.mockResolvedValue(makeRuleDoc());
      await ruleService.createRule('user-1', {
        locationId: 'loc-2',
        parameter: 'windSpeed',
        operator: '>=',
        threshold: 50,
        cooldownMinutes: 15,
      });
      expect(mockedRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        locationId: 'loc-2',
        parameter: 'windSpeed',
        operator: '>=',
        threshold: 50,
        cooldownMinutes: 15,
        active: true,
      });
    });
  });

  describe('updateRule', () => {
    it('should update threshold and return entity', async () => {
      mockedRepo.update.mockResolvedValue(makeRuleDoc({ threshold: 40 }));
      const rule = await ruleService.updateRule('user-1', 'rule-1', { threshold: 40 });
      expect(rule.threshold).toBe(40);
    });

    it('should update active status', async () => {
      mockedRepo.update.mockResolvedValue(makeRuleDoc({ active: false }));
      const rule = await ruleService.updateRule('user-1', 'rule-1', { active: false });
      expect(rule.active).toBe(false);
    });

    it('should update multiple fields at once', async () => {
      mockedRepo.update.mockResolvedValue(
        makeRuleDoc({ parameter: 'humidity', operator: '<', threshold: 20 }),
      );
      const rule = await ruleService.updateRule('user-1', 'rule-1', {
        parameter: 'humidity',
        operator: '<',
        threshold: 20,
      });
      expect(rule.parameter).toBe('humidity');
      expect(rule.operator).toBe('<');
      expect(rule.threshold).toBe(20);
    });

    it('should throw NotFoundError when rule not found', async () => {
      mockedRepo.update.mockResolvedValue(null);
      await expect(
        ruleService.updateRule('user-1', 'rule-x', { threshold: 40 }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when rule belongs to different user', async () => {
      mockedRepo.update.mockResolvedValue(null);
      await expect(
        ruleService.updateRule('user-999', 'rule-1', { threshold: 40 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteRule', () => {
    it('should delete successfully', async () => {
      mockedRepo.delete.mockResolvedValue(makeRuleDoc());
      await expect(ruleService.deleteRule('user-1', 'rule-1')).resolves.not.toThrow();
    });

    it('should call repository with correct userId and ruleId', async () => {
      mockedRepo.delete.mockResolvedValue(makeRuleDoc());
      await ruleService.deleteRule('user-1', 'rule-1');
      expect(mockedRepo.delete).toHaveBeenCalledWith('user-1', 'rule-1');
    });

    it('should throw NotFoundError when rule not found', async () => {
      mockedRepo.delete.mockResolvedValue(null);
      await expect(ruleService.deleteRule('user-1', 'rule-x')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when rule belongs to different user', async () => {
      mockedRepo.delete.mockResolvedValue(null);
      await expect(ruleService.deleteRule('user-999', 'rule-1')).rejects.toThrow(NotFoundError);
    });
  });
});
