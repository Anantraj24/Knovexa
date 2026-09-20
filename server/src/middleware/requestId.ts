import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { generateRequestId } from '../utils/id.js';

export function requestIdMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-request-id'];
  const requestId = typeof incomingId === 'string' ? incomingId : generateRequestId();
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
