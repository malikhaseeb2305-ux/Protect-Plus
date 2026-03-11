import { apiClient } from '@/lib/apiClient';
import type { AlertRuleDto, CreateRuleRequest, UpdateRuleRequest } from '../types';

export async function fetchRules(locationId?: string): Promise<AlertRuleDto[]> {
  const params = locationId ? { locationId } : {};
  const res = await apiClient.get<AlertRuleDto[]>('/rules', { params });
  return res.data;
}

export async function createRule(data: CreateRuleRequest): Promise<AlertRuleDto> {
  const res = await apiClient.post<AlertRuleDto>('/rules', data);
  return res.data;
}

export async function updateRule(id: string, data: UpdateRuleRequest): Promise<AlertRuleDto> {
  const res = await apiClient.put<AlertRuleDto>(`/rules/${id}`, data);
  return res.data;
}

export async function deleteRule(id: string): Promise<void> {
  await apiClient.delete(`/rules/${id}`);
}
