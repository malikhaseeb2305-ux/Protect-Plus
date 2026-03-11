import mongoose, { Schema, Document, Types } from 'mongoose';

export interface WeatherSnapshotDocument extends Document {
  locationId: Types.ObjectId;
  provider: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
    iconCode: string;
    iconUrl: string;
  };
  forecast: {
    date: string;
    high: number;
    low: number;
    description: string;
    iconCode: string;
    iconUrl: string;
  }[];
  fetchedAt: Date;
}

const weatherSnapshotSchema = new Schema<WeatherSnapshotDocument>({
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    default: 'openweathermap',
  },
  current: {
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    description: { type: String, required: true },
    iconCode: { type: String, required: true },
    iconUrl: { type: String, required: true },
  },
  forecast: [
    {
      _id: false,
      date: { type: String, required: true },
      high: { type: Number, required: true },
      low: { type: Number, required: true },
      description: { type: String, required: true },
      iconCode: { type: String, required: true },
      iconUrl: { type: String, required: true },
    },
  ],
  fetchedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

weatherSnapshotSchema.index({ locationId: 1, fetchedAt: -1 });

export const WeatherSnapshotModel = mongoose.model<WeatherSnapshotDocument>(
  'WeatherSnapshot',
  weatherSnapshotSchema,
);
