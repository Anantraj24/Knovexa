import { RetrievalService } from '../rag/retrieval.service.js';

export interface SearchServiceOptions {
  userId: string;
  query: string;
  documentIds?: string[];
  limit?: number;
}

export class SearchService {
  static async search(options: SearchServiceOptions) {
    const chunks = await RetrievalService.retrieveChunks({
      userId: options.userId,
      query: options.query,
      documentIds: options.documentIds,
      limit: options.limit || 10,
    });

    return chunks.map((chunk) => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      pageNumber: chunk.pageNumber,
      score: chunk.score,
      excerpt: chunk.content.slice(0, 300),
    }));
  }
}
