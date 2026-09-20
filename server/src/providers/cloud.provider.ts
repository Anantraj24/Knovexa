import { AIProvider } from './ai.provider.js';
import { GenerateAnswerInput, GenerateAnswerOutput } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class CloudProvider implements AIProvider {
  name = 'cloud';
  private apiKey: string;
  private providerType: 'openai' | 'gemini' | 'groq';

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.apiKey = process.env.GEMINI_API_KEY;
      this.providerType = 'gemini';
    } else if (process.env.GROQ_API_KEY) {
      this.apiKey = process.env.GROQ_API_KEY;
      this.providerType = 'groq';
    } else {
      this.apiKey = process.env.OPENAI_API_KEY || '';
      this.providerType = 'openai';
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      // Deterministic fallback if API key is not yet set
      const vector = new Array(1536).fill(0);
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
      }
      for (let i = 0; i < 1536; i++) {
        vector[i] = parseFloat(Math.sin(hash + i).toFixed(6));
      }
      return vector;
    }

    try {
      if (this.providerType === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text }] },
          }),
        });
        const data = (await res.json()) as any;
        return data.embedding?.values || new Array(1536).fill(0.01);
      } else {
        const endpoint =
          this.providerType === 'groq'
            ? 'https://api.groq.com/openai/v1/embeddings'
            : 'https://api.openai.com/v1/embeddings';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text,
          }),
        });
        const data = (await res.json()) as any;
        return data.data?.[0]?.embedding || new Array(1536).fill(0.01);
      }
    } catch (err) {
      logger.error('Cloud embedding error:', err);
      throw new AppError('AI_PROVIDER_ERROR', 'Cloud embedding provider failed.', 503);
    }
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
    if (!this.apiKey) {
      throw new AppError(
        'AI_PROVIDER_ERROR',
        'Cloud AI provider selected but no GEMINI_API_KEY or OPENAI_API_KEY was found in server/.env.',
        500
      );
    }

    try {
      if (this.providerType === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        const prompt = `${input.systemPrompt}\n\nDocument Context:\n${input.context}\n\nUser Question: ${input.question}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        const data = (await res.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { answer: text.trim() };
      } else {
        const endpoint =
          this.providerType === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

        const model = this.providerType === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: input.systemPrompt || 'Answer based on context.' },
              {
                role: 'user',
                content: `Context:\n${input.context}\n\nQuestion: ${input.question}`,
              },
            ],
            temperature: 0.2,
          }),
        });

        const data = (await res.json()) as any;
        const answer = data.choices?.[0]?.message?.content || '';
        return { answer: answer.trim() };
      }
    } catch (err) {
      logger.error('Cloud answer generation error:', err);
      throw new AppError('AI_PROVIDER_ERROR', 'Cloud generation provider failed.', 503);
    }
  }
}
