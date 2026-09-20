import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, TokenPayload } from '../types/index.js';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 'Authentication token required.', 401));
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('TOKEN_EXPIRED', 'Access token has expired.', 401));
    }
    return next(new AppError('INVALID_TOKEN', 'Invalid authentication token.', 401));
  }
}
