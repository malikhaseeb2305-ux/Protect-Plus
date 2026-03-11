import { z } from 'zod/v4';

export const RegisterRequestSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginRequestSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export interface UserResponseDto {
  id: string;
  email: string;
  preferences: {
    temperatureUnit: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
}
