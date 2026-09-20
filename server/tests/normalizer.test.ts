import { describe, it, expect } from 'vitest';
import { normalizeText } from '../src/services/processing/normalizer.js';

describe('normalizeText', () => {
  it('normalizes excessive linebreaks and whitespace', () => {
    const raw = 'Hello   world!\r\n\r\n\r\n\r\nThis is Knovexa.   \n\nTesting normalizer.';
    const normalized = normalizeText(raw);
    expect(normalized).toBe('Hello   world!\n\nThis is Knovexa.\n\nTesting normalizer.');
  });

  it('throws for empty or whitespace-only documents', () => {
    expect(() => normalizeText('')).toThrow();
    expect(() => normalizeText('    \n\n\r\n  ')).toThrow();
  });
});
