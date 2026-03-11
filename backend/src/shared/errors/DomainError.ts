import { AppError } from './AppError';

export class DomainError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
  }
}
