import { prisma } from '../../repositories/prisma.js';
import { getAIProvider } from '../../providers/index.js';
import { config } from '../../config/index.js';
import { RetrievedChunk } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export interface RetrievalOptions {
  userId: string;
  query: string;
  documentIds?: string[];
  limit?: number;
}

export class RetrievalService {
  static async retrieveChunks(options: RetrievalOptions): Promise<RetrievedChunk[]> {
    const { userId, query, documentIds = [], limit = config.rag.topK } = options;
    const provider = getAIProvider();

    let queryVector: number[] = [];
    try {
      queryVector = await provider.generateEmbedding(query);
    } catch (err) {
      logger.warn('Failed to embed query, using keyword search fallback:', err);
    }

    // If queryVector is available, attempt pgvector cosine distance search
    if (queryVector.length > 0) {
      try {
        const vectorString = `[${queryVector.join(',')}]`;
        let rawResults: Array<{
          id: string;
          documentId: string;
          documentName: string;
          chunkIndex: number;
          pageNumber: number | null;
          content: string;
          distance: number;
        }> = [];

        if (documentIds.length > 0) {
          rawResults = await prisma.$queryRawUnsafe(
            `
            SELECT 
              c.id, 
              c."documentId", 
              d.name as "documentName", 
              c."chunkIndex", 
              c."pageNumber", 
              c.content, 
              (c.embedding <=> $1::vector) as distance
            FROM "DocumentChunk" c
            JOIN "Document" d ON c."documentId" = d.id
            WHERE d."userId" = $2 
              AND d.status = 'READY'
              AND d.id = ANY($3::text[])
              AND c.embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT $4
            `,
            vectorString,
            userId,
            documentIds,
            limit
          );
        } else {
          rawResults = await prisma.$queryRawUnsafe(
            `
            SELECT 
              c.id, 
              c."documentId", 
              d.name as "documentName", 
              c."chunkIndex", 
              c."pageNumber", 
              c.content, 
              (c.embedding <=> $1::vector) as distance
            FROM "DocumentChunk" c
            JOIN "Document" d ON c."documentId" = d.id
            WHERE d."userId" = $2 
              AND d.status = 'READY'
              AND c.embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT $3
            `,
            vectorString,
            userId,
            limit
          );
        }

        if (rawResults && rawResults.length > 0) {
          return rawResults.map((r) => ({
            id: r.id,
            documentId: r.documentId,
            documentName: r.documentName,
            chunkIndex: r.chunkIndex,
            pageNumber: r.pageNumber,
            content: r.content,
            score: parseFloat((1 - (r.distance ?? 0.5)).toFixed(4)),
          }));
        }
      } catch (vectorErr) {
        logger.debug('pgvector search not available or table has no vector extension, falling back to text scoring:', vectorErr);
      }
    }

    // Fallback: Prisma text search with token similarity ranking
    const whereClause: {
      document: {
        userId: string;
        status: 'READY';
        id?: { in: string[] };
      };
    } = {
      document: {
        userId,
        status: 'READY',
      },
    };

    if (documentIds.length > 0) {
      whereClause.document.id = { in: documentIds };
    }

    const chunks = await prisma.documentChunk.findMany({
      where: whereClause,
      include: {
        document: {
          select: { id: true, name: true },
        },
      },
      take: 100,
    });

    // Score chunks based on keyword presence
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    const scored = chunks.map((c) => {
      const lower = c.content.toLowerCase();
      let matchCount = 0;
      for (const term of queryTerms) {
        if (lower.includes(term)) matchCount++;
      }
      const score = queryTerms.length > 0 ? matchCount / queryTerms.length : 0.5;
      return {
        id: c.id,
        documentId: c.documentId,
        documentName: c.document.name,
        chunkIndex: c.chunkIndex,
        pageNumber: c.pageNumber,
        content: c.content,
        score: parseFloat(score.toFixed(4)),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}
