import { apiClient } from '@/lib/apiClient';

import type { RegisterRequest, LoginRequest, AuthResponse, UserDto } from '../types';

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', data);
  return res.data;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function fetchCurrentUser(): Promise<UserDto> {
  const res = await apiClient.get<{ user: UserDto }>('/auth/me');
  return res.data.user;
}
