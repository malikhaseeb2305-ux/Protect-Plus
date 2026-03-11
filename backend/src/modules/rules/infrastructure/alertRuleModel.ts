import mongoose, { Schema, Document, Types } from 'mongoose';

export interface AlertRuleDocument extends Document {
  userId: Types.ObjectId;
  locationId: Types.ObjectId;
  parameter: 'temperature' | 'humidity' | 'windSpeed';
  operator: '<' | '>' | '<=' | '>=';
  threshold: number;
  active: boolean;
  cooldownMinutes: number;
  lastEvaluatedAt: Date | null;
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const alertRuleSchema = new Schema<AlertRuleDocument>(
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
    parameter: {
      type: String,
      enum: ['temperature', 'humidity', 'windSpeed'],
      required: true,
    },
    operator: {
      type: String,
      enum: ['<', '>', '<=', '>='],
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    cooldownMinutes: {
      type: Number,
      default: 30,
    },
    lastEvaluatedAt: {
      type: Date,
      default: null,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

alertRuleSchema.index({ userId: 1, locationId: 1 });
alertRuleSchema.index({ active: 1 });

export const AlertRuleModel = mongoose.model<AlertRuleDocument>('AlertRule', alertRuleSchema);
