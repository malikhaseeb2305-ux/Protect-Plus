import mongoose, { Schema, Document, Types } from 'mongoose';

export interface LocationDocument extends Document {
  userId: Types.ObjectId;
  cityName: string;
  countryCode: string;
  lat: number;
  lon: number;
  displayName: string;
  sortOrder: number;
  isCurrentLocation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<LocationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isCurrentLocation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

locationSchema.index({ userId: 1, sortOrder: 1 });
locationSchema.index({ userId: 1, cityName: 1, countryCode: 1 });

export const LocationModel = mongoose.model<LocationDocument>('Location', locationSchema);
