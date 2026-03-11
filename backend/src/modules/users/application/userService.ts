import { DomainError, NotFoundError } from '../../../shared/errors';
import { userRepository } from '../infrastructure/userRepository';
import { UserEntity, UserPreferences, TemperatureUnit } from '../domain/types';

const VALID_UNITS: TemperatureUnit[] = ['C', 'F'];

function toUserEntity(doc: { _id: unknown; email: string; preferences: { temperatureUnit: TemperatureUnit }; createdAt: Date; updatedAt: Date }): UserEntity {
  return {
    id: String(doc._id),
    email: doc.email,
    preferences: {
      temperatureUnit: doc.preferences.temperatureUnit,
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const userService = {
  async updateSettings(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<UserEntity> {
    if (preferences.temperatureUnit && !VALID_UNITS.includes(preferences.temperatureUnit)) {
      throw new DomainError(`Invalid temperature unit. Must be one of: ${VALID_UNITS.join(', ')}`);
    }

    const doc = await userRepository.updatePreferences(userId, preferences);
    if (!doc) {
      throw new NotFoundError('User');
    }

    return toUserEntity(doc);
  },
};
