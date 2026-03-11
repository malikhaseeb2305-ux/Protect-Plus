import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from '../authService';
import { userRepository } from '../../../users/infrastructure/userRepository';

jest.mock('../../../users/infrastructure/userRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const fakeUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  preferences: { temperatureUnit: 'C' as const },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
  });

  describe('register', () => {
    it('should create a user and return token', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepo.create.mockResolvedValue(fakeUser as never);

      const result = await authService.register('test@example.com', 'password123');

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw on duplicate email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(fakeUser as never);

      await expect(authService.register('test@example.com', 'password123')).rejects.toThrow(
        'A user with this email already exists',
      );
    });

    it('should throw on short password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.register('test@example.com', 'short')).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });
  });

  describe('login', () => {
    it('should return user and token on valid credentials', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(fakeUser as never);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw on non-existent email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login('no@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw on wrong password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(fakeUser as never);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });
});
