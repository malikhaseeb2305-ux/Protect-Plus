export interface AlertNotificationDto {
  id: string;
  locationId: string;
  ruleId: string;
  triggeredAt: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UnreadCountDto {
  count: number;
}
