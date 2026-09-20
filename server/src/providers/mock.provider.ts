import { AIProvider } from './ai.provider.js';
import { GenerateAnswerInput, GenerateAnswerOutput } from '../types/index.js';
import { config } from '../config/index.js';

export class MockAIProvider implements AIProvider {
  name = 'mock';

  async generateEmbedding(text: string): Promise<number[]> {
    // Generate deterministic 1536-dimensional float vector seeded by text content
    const vector = new Array(1536).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < 1536; i++) {
      const val = Math.sin(hash + i);
      vector[i] = parseFloat(val.toFixed(6));
    }

    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => parseFloat((v / norm).toFixed(6)));
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
    const { question, context } = input;

    if (!context || context.trim().length === 0) {
      return { answer: config.rag.insufficientContextMessage };
    }

    // Check if question keywords are contained in the context
    const cleanQuestion = question.toLowerCase();
    const cleanContext = context.toLowerCase();

    // Extract significant query terms (length > 3)
    const keywords = cleanQuestion
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['what', 'when', 'where', 'which', 'who', 'does', 'with', 'about', 'have'].includes(w));

    const matches = keywords.filter((word) => cleanContext.includes(word));

    if (keywords.length > 0 && matches.length === 0) {
      return { answer: config.rag.insufficientContextMessage };
    }

    // Return grounded answer citing the source chunk [1]
    return {
      answer: `Based on the provided documents, ${context.split('\n')[0].replace(/^\[Chunk \d+\]\s*/, '')} [1]`,
    };
  }
}
