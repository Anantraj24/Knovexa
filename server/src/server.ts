import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`Knovexa Server listening on port ${config.port} in ${config.env} mode`);
  logger.info(`AI Provider: ${config.ai.provider}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});
