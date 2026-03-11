import { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { validateOrThrow } from '../../../shared/utils/validateOrThrow';

import { ruleService } from '../application/ruleService';
import { RuleQuerySchema, CreateRuleSchema, UpdateRuleSchema, toRuleResponse } from './dtos';

function getUserId(req: Request): string {
  return (req as Request & { user: { userId: string } }).user.userId;
}

function getParamId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? raw[0] : raw;
}

export const ruleController = {
  getRules: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { locationId } = validateOrThrow(RuleQuerySchema.safeParse(req.query));
    const rules = await ruleService.getRules(userId, locationId);
    res.json(rules.map(toRuleResponse));
  }),

  createRule: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const payload = validateOrThrow(CreateRuleSchema.safeParse(req.body));
    const rule = await ruleService.createRule(userId, payload);
    res.status(201).json(toRuleResponse(rule));
  }),

  updateRule: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const ruleId = getParamId(req);
    const payload = validateOrThrow(UpdateRuleSchema.safeParse(req.body));
    const rule = await ruleService.updateRule(userId, ruleId, payload);
    res.json(toRuleResponse(rule));
  }),

  deleteRule: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const ruleId = getParamId(req);
    await ruleService.deleteRule(userId, ruleId);
    res.status(204).send();
  }),
};
