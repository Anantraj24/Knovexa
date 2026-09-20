import { describe, it, expect } from 'vitest';
import { chunkText } from '../src/services/processing/chunker.js';

describe('chunkText', () => {
  it('creates deterministic chunks', () => {
    const result = chunkText('Knovexa turns static documents into interactive knowledge workspaces.', {
      maxTokens: 500,
      overlap: 50,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].content).toContain('Knovexa');
    expect(result[0].chunkIndex).toBe(0);
  });

  it('handles multi-paragraph long documents with overlap', () => {
    const paragraphs = [
      'Knovexa transforms documents into knowledge. It includes RAG, vector search, and citation grounding.',
      'Architecture principles emphasize modular layers: router, controller, service, repository, and AI provider.',
      'Frontend is built with React 19, Tailwind CSS, TanStack Query, and Vite for optimal speed and reliability.',
    ];
    const text = paragraphs.join('\n\n');
    const chunks = chunkText(text, { maxTokens: 20, overlap: 5 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[1].chunkIndex).toBe(1);
  });

  it('returns empty array for empty strings', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   ')).toEqual([]);
  });
});
