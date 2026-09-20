import { AIProvider } from './ai.provider.js';
import { OllamaProvider } from './ollama.provider.js';
import { MockAIProvider } from './mock.provider.js';
import { CloudProvider } from './cloud.provider.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = config.ai.provider;
  logger.info(`Initializing AI Provider: ${providerType}`);

  switch (providerType) {
    case 'ollama':
      cachedProvider = new OllamaProvider();
      break;
    case 'cloud':
      cachedProvider = new CloudProvider();
      break;
    case 'mock':
    default:
      cachedProvider = new MockAIProvider();
      break;
  }

  return cachedProvider;
}

export function setAIProvider(provider: AIProvider) {
  cachedProvider = provider;
}
