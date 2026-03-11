import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from '../../../shared/config';
import { DomainError, AuthError } from '../../../shared/errors';
import { userRepository } from '../../users/infrastructure/userRepository';
import { UserEntity } from '../../users/domain/types';

import { AuthTokenPayload } from '../domain/types';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

function toUserEntity(doc: { _id: unknown; email: string; preferences: { temperatureUnit: 'C' | 'F' }; createdAt: Date; updatedAt: Date }): UserEntity {
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

function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

export const authService = {
  async register(email: string, password: string): Promise<{ user: UserEntity; token: string }> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new DomainError('A user with this email already exists', 409);
    }

    if (password.length < 8) {
      throw new DomainError('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const doc = await userRepository.create({ email, passwordHash });

    const user = toUserEntity(doc);
    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
  },

  async login(email: string, password: string): Promise<{ user: UserEntity; token: string }> {
    const doc = await userRepository.findByEmail(email);
    if (!doc) {
      throw new AuthError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, doc.passwordHash);
    if (!isMatch) {
      throw new AuthError('Invalid email or password');
    }

    const user = toUserEntity(doc);
    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
  },

  async getCurrentUser(userId: string): Promise<UserEntity> {
    const doc = await userRepository.findById(userId);
    if (!doc) {
      throw new AuthError('User not found');
    }
    return toUserEntity(doc);
  },
};
