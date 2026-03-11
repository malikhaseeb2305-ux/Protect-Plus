export interface AlertNotificationEntity {
  id: string;
  userId: string;
  locationId: string;
  ruleId: string;
  triggeredAt: Date;
  message: string;
  snapshotId: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
