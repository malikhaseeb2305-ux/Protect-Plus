import { AlertRuleModel, AlertRuleDocument } from './alertRuleModel';

export const alertRuleRepository = {
  async findByUser(userId: string, locationId?: string): Promise<AlertRuleDocument[]> {
    const filter: Record<string, unknown> = { userId };
    if (locationId) filter.locationId = locationId;
    return AlertRuleModel.find(filter).sort({ createdAt: -1 }).exec();
  },

  async findAllActive(): Promise<AlertRuleDocument[]> {
    return AlertRuleModel.find({ active: true }).exec();
  },

  async findById(userId: string, ruleId: string): Promise<AlertRuleDocument | null> {
    return AlertRuleModel.findOne({ _id: ruleId, userId });
  },

  async create(data: {
    userId: string;
    locationId: string;
    parameter: string;
    operator: string;
    threshold: number;
    cooldownMinutes?: number;
    active?: boolean;
  }): Promise<AlertRuleDocument> {
    return AlertRuleModel.create(data);
  },

  async update(
    userId: string,
    ruleId: string,
    data: Partial<{
      parameter: string;
      operator: string;
      threshold: number;
      cooldownMinutes: number;
      active: boolean;
    }>,
  ): Promise<AlertRuleDocument | null> {
    return AlertRuleModel.findOneAndUpdate({ _id: ruleId, userId }, { $set: data }, { new: true });
  },

  async delete(userId: string, ruleId: string): Promise<AlertRuleDocument | null> {
    return AlertRuleModel.findOneAndDelete({ _id: ruleId, userId });
  },

  async updateEvaluationTimestamps(
    ruleId: string,
    lastEvaluatedAt: Date,
    lastTriggeredAt?: Date,
  ): Promise<void> {
    const update: Record<string, unknown> = { lastEvaluatedAt };
    if (lastTriggeredAt) update.lastTriggeredAt = lastTriggeredAt;
    await AlertRuleModel.findByIdAndUpdate(ruleId, { $set: update });
  },

  async claimTrigger(
    ruleId: string,
    cooldownMinutes: number,
    now: Date,
  ): Promise<boolean> {
    const cooldownCutoff = new Date(now.getTime() - cooldownMinutes * 60 * 1000);
    const result = await AlertRuleModel.findOneAndUpdate(
      {
        _id: ruleId,
        $or: [
          { lastTriggeredAt: null },
          { lastTriggeredAt: { $lte: cooldownCutoff } },
        ],
      },
      { $set: { lastTriggeredAt: now, lastEvaluatedAt: now } },
      { new: true },
    );
    return result !== null;
  },
};
