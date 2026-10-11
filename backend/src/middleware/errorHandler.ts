import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

function sendError(res: Response, statusCode: number, message: string, error: string): void {
  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message, err.details);
    return;
  }

  const message = err instanceof Error ? err.message : 'Unexpected error';
  logger.error('Unhandled request error', { message });
  sendError(res, 500, 'Internal server error', 'Internal server error');
}
