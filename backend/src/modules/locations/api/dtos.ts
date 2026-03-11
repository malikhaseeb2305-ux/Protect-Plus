import { z } from 'zod/v4';

export const CreateLocationSchema = z.object({
  cityName: z.string().min(1, 'City name is required'),
  countryCode: z.string().min(2).max(3, 'Country code must be 2-3 characters'),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  displayName: z.string().optional(),
  isCurrentLocation: z.boolean().optional(),
});

export const UpdateLocationSchema = z.object({
  cityName: z.string().min(1).optional(),
  countryCode: z.string().min(2).max(3).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  displayName: z.string().optional(),
});

export const ReorderLocationsSchema = z.object({
  orderedIds: z.array(z.string()).min(1, 'At least one ID is required'),
});

export const DetectLocationSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

export type CreateLocationRequest = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationRequest = z.infer<typeof UpdateLocationSchema>;
export type ReorderLocationsRequest = z.infer<typeof ReorderLocationsSchema>;
export type DetectLocationRequest = z.infer<typeof DetectLocationSchema>;

export interface LocationResponseDto {
  id: string;
  cityName: string;
  countryCode: string;
  lat: number;
  lon: number;
  displayName: string;
  sortOrder: number;
  isCurrentLocation: boolean;
  createdAt: string;
  updatedAt: string;
}
