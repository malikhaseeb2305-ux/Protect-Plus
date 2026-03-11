import mongoose, { Schema, Document, Types } from 'mongoose';

export interface AlertNotificationDocument extends Document {
  userId: Types.ObjectId;
  locationId: Types.ObjectId;
  ruleId: Types.ObjectId;
  triggeredAt: Date;
  message: string;
  snapshotId: Types.ObjectId | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertNotificationSchema = new Schema<AlertNotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    ruleId: {
      type: Schema.Types.ObjectId,
      ref: 'AlertRule',
      required: true,
    },
    triggeredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    message: {
      type: String,
      required: true,
    },
    snapshotId: {
      type: Schema.Types.ObjectId,
      ref: 'WeatherSnapshot',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

alertNotificationSchema.index({ userId: 1, triggeredAt: -1 });
alertNotificationSchema.index({ userId: 1, read: 1 });

export const AlertNotificationModel = mongoose.model<AlertNotificationDocument>(
  'AlertNotification',
  alertNotificationSchema,
);
