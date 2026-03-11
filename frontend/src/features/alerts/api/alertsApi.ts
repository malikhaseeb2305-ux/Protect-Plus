import { apiClient } from '@/lib/apiClient';
import type { AlertNotificationDto, UnreadCountDto } from '../types';

export async function fetchAlerts(page = 1, limit = 20): Promise<AlertNotificationDto[]> {
  const res = await apiClient.get<AlertNotificationDto[]>('/alerts', {
    params: { page, limit },
  });
  return res.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<UnreadCountDto>('/alerts/unread-count');
  return res.data.count;
}

export async function markAlertRead(id: string): Promise<AlertNotificationDto> {
  const res = await apiClient.patch<AlertNotificationDto>(`/alerts/${id}/read`);
  return res.data;
}

export async function markAllAlertsRead(): Promise<void> {
  await apiClient.patch('/alerts/read-all');
}
