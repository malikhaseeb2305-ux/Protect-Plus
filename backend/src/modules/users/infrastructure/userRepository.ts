import { UserModel, UserDocument } from './userModel';
import { UserPreferences } from '../domain/types';

export const userRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  },

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  },

  async create(data: {
    email: string;
    passwordHash: string;
  }): Promise<UserDocument> {
    return UserModel.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      preferences: { temperatureUnit: 'C' },
    });
  },

  async updatePreferences(
    id: string,
    preferences: Partial<UserPreferences>,
  ): Promise<UserDocument | null> {
    const updateFields: Record<string, unknown> = {};

    if (preferences.temperatureUnit) {
      updateFields['preferences.temperatureUnit'] = preferences.temperatureUnit;
    }

    return UserModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
  },
};
