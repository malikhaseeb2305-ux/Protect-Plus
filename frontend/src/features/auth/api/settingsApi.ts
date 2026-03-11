import { apiClient } from '@/lib/apiClient';

import type { UpdateSettingsRequest, UserDto } from '../types';

export async function updateUserSettings(data: UpdateSettingsRequest): Promise<UserDto> {
  const res = await apiClient.patch<{ user: UserDto }>('/users/me/settings', data);
  return res.data.user;
}
