import { Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error | AppError,
  req: AuthenticatedRequest,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  const requestId = req.id || 'unknown';

  if (err instanceof ZodError) {
    logger.warn(`[${requestId}] Validation Error:`, err.errors);
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        requestId,
      },
    });
  }

  if (err instanceof AppError) {
    logger.warn(`[${requestId}] AppError [${err.code}]: ${err.message}`);
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    });
  }

  logger.error(`[${requestId}] Unhandled Server Error:`, err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred.',
      requestId,
    },
  });
}
