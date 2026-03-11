import { ValidationError } from '../errors';

interface SafeParseSuccess<T> {
  success: true;
  data: T;
}

interface SafeParseError {
  success: false;
  error: {
    issues: readonly { path: readonly PropertyKey[]; message: string }[];
  };
}

type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError;

export function validateOrThrow<T>(result: SafeParseResult<T>): T {
  if (!result.success) {
    const fields = result.error.issues.map((issue) => ({
      field: issue.path.map(String).join('.'),
      message: issue.message,
    }));
    throw new ValidationError('Validation failed', fields);
  }
  return result.data;
}
