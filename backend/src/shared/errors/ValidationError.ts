import { AppError } from './AppError';

export interface FieldError {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly fields: FieldError[];

  constructor(message: string, fields: FieldError[] = []) {
    super(message, 400);
    this.fields = fields;
  }
}
