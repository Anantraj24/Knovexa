import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../src/providers/mock.provider.js';
import { config } from '../src/config/index.js';

describe('RAG Grounding & Hallucination Prevention', () => {
  const provider = new MockAIProvider();

  it('answers and cites when context is sufficient', async () => {
    const context = 'Project deadline is September 30.';
    const result = await provider.generateAnswer({
      question: 'When is the project deadline?',
      context,
    });

    expect(result.answer).toContain('September 30');
    expect(result.answer).toContain('[1]');
  });

  it('rejects answering when context does not contain sufficient information', async () => {
    const context = 'The project uses PostgreSQL.';
    const result = await provider.generateAnswer({
      question: 'Which cloud provider hosts the database?',
      context,
    });

    expect(result.answer).toBe(config.rag.insufficientContextMessage);
  });

  it('generates normalized 1536-dimensional embedding vectors', async () => {
    const vector = await provider.generateEmbedding('Knovexa document intelligence platform');
    expect(vector.length).toBe(1536);
    expect(typeof vector[0]).toBe('number');
  });
});
