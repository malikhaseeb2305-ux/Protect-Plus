import { z } from 'zod/v4';

export const UpdateSettingsSchema = z.object({
  temperatureUnit: z.enum(['C', 'F']).optional(),
});

export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsSchema>;
