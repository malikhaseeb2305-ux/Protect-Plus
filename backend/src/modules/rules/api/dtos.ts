import { z } from 'zod';
import { AlertRuleEntity } from '../domain/types';

export const RuleQuerySchema = z.object({
  locationId: z.string().min(1).optional(),
});

export const CreateRuleSchema = z.object({
  locationId: z.string().min(1, 'locationId is required'),
  parameter: z.enum(['temperature', 'humidity', 'windSpeed']),
  operator: z.enum(['<', '>', '<=', '>=']),
  threshold: z.number(),
  cooldownMinutes: z
    .number()
    .int()
    .min(5, 'Minimum cooldown is 5 minutes')
    .optional(),
});

export const UpdateRuleSchema = z.object({
  parameter: z.enum(['temperature', 'humidity', 'windSpeed']).optional(),
  operator: z.enum(['<', '>', '<=', '>=']).optional(),
  threshold: z.number().optional(),
  cooldownMinutes: z
    .number()
    .int()
    .min(5, 'Minimum cooldown is 5 minutes')
    .optional(),
  active: z.boolean().optional(),
});

export type CreateRuleDto = z.infer<typeof CreateRuleSchema>;
export type UpdateRuleDto = z.infer<typeof UpdateRuleSchema>;

export interface RuleResponseDto {
  id: string;
  locationId: string;
  parameter: string;
  operator: string;
  threshold: number;
  active: boolean;
  cooldownMinutes: number;
  lastEvaluatedAt: string | null;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export function toRuleResponse(entity: AlertRuleEntity): RuleResponseDto {
  return {
    id: entity.id,
    locationId: entity.locationId,
    parameter: entity.parameter,
    operator: entity.operator,
    threshold: entity.threshold,
    active: entity.active,
    cooldownMinutes: entity.cooldownMinutes,
    lastEvaluatedAt: entity.lastEvaluatedAt?.toISOString() ?? null,
    lastTriggeredAt: entity.lastTriggeredAt?.toISOString() ?? null,
    createdAt: entity.createdAt.toISOString(),
  };
}
