export class ApiError extends Error {
  readonly statusCode: number;
  readonly details: string;

  constructor(statusCode: number, message: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details ?? message;
  }
}
