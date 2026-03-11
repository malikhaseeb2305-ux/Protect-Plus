import {
  AlertNotificationModel,
  AlertNotificationDocument,
} from './alertNotificationModel';

export const alertNotificationRepository = {
  async findByUser(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<AlertNotificationDocument[]> {
    const skip = (options.page - 1) * options.limit;
    return AlertNotificationModel.find({ userId })
      .sort({ triggeredAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .exec();
  },

  async countUnread(userId: string): Promise<number> {
    return AlertNotificationModel.countDocuments({ userId, read: false });
  },

  async create(data: {
    userId: string;
    locationId: string;
    ruleId: string;
    triggeredAt: Date;
    message: string;
    snapshotId?: string;
  }): Promise<AlertNotificationDocument> {
    return AlertNotificationModel.create({
      ...data,
      read: false,
    });
  },

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<AlertNotificationDocument | null> {
    return AlertNotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } },
      { new: true },
    );
  },

  async markAllAsRead(userId: string): Promise<void> {
    await AlertNotificationModel.updateMany({ userId, read: false }, { $set: { read: true } });
  },
};
