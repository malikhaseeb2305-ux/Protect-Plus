import { AppError } from './AppError';

export class AuthError extends AppError {
  constructor(message = 'Authentication required', statusCode = 401) {
    super(message, statusCode);
  }
}
