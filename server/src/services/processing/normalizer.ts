import { AppError } from '../../middleware/errorHandler.js';

export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new AppError('EMPTY_DOCUMENT', 'Document contains no readable text.', 422);
  }

  // Remove null characters and replace windows/mac linebreaks with unix \n
  let normalized = text.replace(/\0/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Collapse multiple blank lines into two
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // Strip excessive trailing spaces on lines
  normalized = normalized
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

  if (normalized.length === 0) {
    throw new AppError('EMPTY_DOCUMENT', 'Document text is empty after normalization.', 422);
  }

  return normalized;
}
