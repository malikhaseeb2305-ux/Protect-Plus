import { NotFoundError } from '../../../shared/errors';
import { alertRuleRepository } from '../infrastructure/alertRuleRepository';
import { AlertRuleEntity } from '../domain/types';
import { AlertRuleDocument } from '../infrastructure/alertRuleModel';

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

export const ruleService = {
  async getRules(userId: string, locationId?: string): Promise<AlertRuleEntity[]> {
    const docs = await alertRuleRepository.findByUser(userId, locationId);
    return docs.map(toEntity);
  },

  async createRule(
    userId: string,
    payload: {
      locationId: string;
      parameter: string;
      operator: string;
      threshold: number;
      cooldownMinutes?: number;
    },
  ): Promise<AlertRuleEntity> {
    const doc = await alertRuleRepository.create({
      userId,
      locationId: payload.locationId,
      parameter: payload.parameter,
      operator: payload.operator,
      threshold: payload.threshold,
      cooldownMinutes: payload.cooldownMinutes ?? 30,
      active: true,
    });
    return toEntity(doc);
  },

  async updateRule(
    userId: string,
    ruleId: string,
    payload: Partial<{
      parameter: string;
      operator: string;
      threshold: number;
      cooldownMinutes: number;
      active: boolean;
    }>,
  ): Promise<AlertRuleEntity> {
    const doc = await alertRuleRepository.update(userId, ruleId, payload);
    if (!doc) {
      throw new NotFoundError('Alert rule');
    }
    return toEntity(doc);
  },

  async deleteRule(userId: string, ruleId: string): Promise<void> {
    const doc = await alertRuleRepository.delete(userId, ruleId);
    if (!doc) {
      throw new NotFoundError('Alert rule');
    }
  },
};
