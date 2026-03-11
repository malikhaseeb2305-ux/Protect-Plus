import mongoose, { Schema, Document } from 'mongoose';
import { TemperatureUnit } from '../domain/types';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  preferences: {
    temperatureUnit: TemperatureUnit;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    preferences: {
      temperatureUnit: {
        type: String,
        enum: ['C', 'F'],
        default: 'C',
      },
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
