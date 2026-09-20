import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'knovexa_dev_access_secret_min_32_chars_long',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'knovexa_dev_refresh_secret_min_32_chars_long',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  ai: {
    provider: (process.env.AI_PROVIDER || 'mock') as 'ollama' | 'cloud' | 'mock',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaChatModel: process.env.OLLAMA_CHAT_MODEL || 'llama3.1:8b',
    ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
  },
  storage: {
    uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './storage/uploads'),
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),
  },
  rag: {
    topK: 8,
    similarityThreshold: 0.65,
    insufficientContextMessage: 'The available documents do not contain enough information to answer this question.',
  },
};
