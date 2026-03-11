import { AxiosError } from 'axios';

export function extractApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.response?.status === 401) return 'Invalid credentials';
    if (error.response?.status === 409) return 'An account with this email already exists';
    if (error.response?.status === 429) return 'Too many requests. Please try again later.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
