import { NotFoundError } from '../../../shared/errors';
import { alertNotificationRepository } from '../infrastructure/alertNotificationRepository';
import { AlertNotificationEntity } from '../domain/types';
import { AlertNotificationDocument } from '../infrastructure/alertNotificationModel';

function toEntity(doc: AlertNotificationDocument): AlertNotificationEntity {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    locationId: String(doc.locationId),
    ruleId: String(doc.ruleId),
    triggeredAt: doc.triggeredAt,
    message: doc.message,
    snapshotId: doc.snapshotId ? String(doc.snapshotId) : null,
    read: doc.read,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const alertService = {
  async getAlerts(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<AlertNotificationEntity[]> {
    const docs = await alertNotificationRepository.findByUser(userId, { page, limit });
    return docs.map(toEntity);
  },

  async getUnreadCount(userId: string): Promise<number> {
    return alertNotificationRepository.countUnread(userId);
  },

  async markRead(userId: string, notificationId: string): Promise<AlertNotificationEntity> {
    const doc = await alertNotificationRepository.markAsRead(userId, notificationId);
    if (!doc) {
      throw new NotFoundError('Alert notification');
    }
    return toEntity(doc);
  },

  async markAllRead(userId: string): Promise<void> {
    await alertNotificationRepository.markAllAsRead(userId);
  },

  async createNotification(data: {
    userId: string;
    locationId: string;
    ruleId: string;
    message: string;
    snapshotId?: string;
  }): Promise<AlertNotificationEntity> {
    const doc = await alertNotificationRepository.create({
      ...data,
      triggeredAt: new Date(),
    });
    return toEntity(doc);
  },
};
