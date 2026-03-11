import { z } from 'zod';
import { AlertNotificationEntity } from '../domain/types';

export const AlertQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export interface AlertResponseDto {
  id: string;
  locationId: string;
  ruleId: string;
  triggeredAt: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function toAlertResponse(entity: AlertNotificationEntity): AlertResponseDto {
  return {
    id: entity.id,
    locationId: entity.locationId,
    ruleId: entity.ruleId,
    triggeredAt: entity.triggeredAt.toISOString(),
    message: entity.message,
    read: entity.read,
    createdAt: entity.createdAt.toISOString(),
  };
}
