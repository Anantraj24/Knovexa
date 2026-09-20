export interface ChunkOptions {
  maxTokens?: number;
  overlap?: number;
  defaultPageNumber?: number;
}

export interface ChunkOutput {
  chunkIndex: number;
  content: string;
  pageNumber?: number;
  tokenCount: number;
}

// Approximate 4 chars per token for English text
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string, options: ChunkOptions = {}): ChunkOutput[] {
  const maxTokens = options.maxTokens ?? 500;
  const overlapTokens = options.overlap ?? 50;
  const maxChars = maxTokens * 4;
  const overlapChars = overlapTokens * 4;

  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: ChunkOutput[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    // If single paragraph is longer than maxChars, split by sentences
    if (paragraph.length > maxChars) {
      if (currentChunk.trim().length > 0) {
        chunks.push({
          chunkIndex: chunkIndex++,
          content: currentChunk.trim(),
          pageNumber: options.defaultPageNumber,
          tokenCount: estimateTokens(currentChunk.trim()),
        });
        currentChunk = '';
      }

      const sentences = paragraph.split(/(?<=[.?!])\s+/);
      for (const sentence of sentences) {
        if ((currentChunk + ' ' + sentence).length > maxChars && currentChunk.length > 0) {
          chunks.push({
            chunkIndex: chunkIndex++,
            content: currentChunk.trim(),
            pageNumber: options.defaultPageNumber,
            tokenCount: estimateTokens(currentChunk.trim()),
          });
          const overlapStart = Math.max(0, currentChunk.length - overlapChars);
          currentChunk = currentChunk.slice(overlapStart) + ' ' + sentence;
        } else {
          currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
        }
      }
    } else {
      if ((currentChunk + '\n\n' + paragraph).length > maxChars && currentChunk.length > 0) {
        chunks.push({
          chunkIndex: chunkIndex++,
          content: currentChunk.trim(),
          pageNumber: options.defaultPageNumber,
          tokenCount: estimateTokens(currentChunk.trim()),
        });
        const overlapStart = Math.max(0, currentChunk.length - overlapChars);
        currentChunk = currentChunk.slice(overlapStart) + '\n\n' + paragraph;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      chunkIndex: chunkIndex++,
      content: currentChunk.trim(),
      pageNumber: options.defaultPageNumber,
      tokenCount: estimateTokens(currentChunk.trim()),
    });
  }

  return chunks;
}
