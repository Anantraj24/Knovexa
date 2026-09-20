import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { documentRouter } from './routes/document.routes.js';
import { collectionRouter } from './routes/collection.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { searchRouter } from './routes/search.routes.js';
import { healthRouter } from './routes/health.routes.js';

export const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestIdMiddleware);

// API v1 routes
app.use('/api/v1', healthRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/collections', collectionRouter);
app.use('/api/v1/conversations', chatRouter);
app.use('/api/v1', searchRouter);

// 404 handler for undefined endpoints
app.use((_req, _res, next) => {
  next(new AppError('NOT_FOUND', 'The requested resource does not exist.', 404));
});

// Centralized error handling
app.use(errorHandler);
