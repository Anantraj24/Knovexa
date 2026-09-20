import { AIProvider } from './ai.provider.js';
import { GenerateAnswerInput, GenerateAnswerOutput } from '../types/index.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private baseUrl: string;
  private chatModel: string;
  private embeddingModel: string;

  constructor() {
    this.baseUrl = config.ai.ollamaBaseUrl;
    this.chatModel = config.ai.ollamaChatModel;
    this.embeddingModel = config.ai.ollamaEmbeddingModel;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.embeddingModel,
          prompt: text,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama embeddings failed with status ${res.status}`);
      }

      const data = (await res.json()) as { embedding: number[] };
      return data.embedding;
    } catch (err: unknown) {
      logger.error('Ollama embedding error:', err);
      throw new AppError(
        'AI_PROVIDER_ERROR',
        `Ollama embedding service unavailable at ${this.baseUrl}. Make sure Ollama is running and model '${this.embeddingModel}' is pulled.`,
        503
      );
    }
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
    try {
      const prompt = `${input.systemPrompt ? `${input.systemPrompt}\n\n` : ''}Context:\n${input.context}\n\nQuestion: ${input.question}\n\nAnswer:`;

      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.chatModel,
          prompt,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama generation failed with status ${res.status}`);
      }

      const data = (await res.json()) as { response: string };
      return {
        answer: data.response.trim(),
      };
    } catch (err: unknown) {
      logger.error('Ollama generation error:', err);
      throw new AppError(
        'AI_PROVIDER_ERROR',
        `Ollama generation service unavailable at ${this.baseUrl}. Make sure Ollama is running and model '${this.chatModel}' is pulled.`,
        503
      );
    }
  }
}
