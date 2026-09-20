import path from 'path';
import { prisma } from '../../repositories/prisma.js';
import { DocumentStatus } from '@prisma/client';
import { ParserService } from './parser.service.js';
import { getAIProvider } from '../../providers/index.js';
import { logger } from '../../utils/logger.js';

export class IngestService {
  static async processDocument(documentId: string): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      logger.error(`IngestService: Document ${documentId} not found.`);
      return;
    }

    try {
      logger.info(`Starting ingestion for document ${documentId} (${document.name})`);
      await prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING, errorMessage: null },
      });

      const absolutePath = path.resolve(process.cwd(), document.storagePath);
      const parsed = await ParserService.parseFile(absolutePath, document.type);

      // Clean up previous chunks if reprocessing
      await prisma.documentChunk.deleteMany({
        where: { documentId },
      });

      const provider = getAIProvider();

      // Create chunks and compute embeddings
      for (const chunk of parsed.chunks) {
        let embeddingVector: number[] = [];
        try {
          embeddingVector = await provider.generateEmbedding(chunk.content);
        } catch (embErr) {
          logger.warn(`Failed to generate embedding for chunk ${chunk.chunkIndex}, saving without vector:`, embErr);
        }

        // Insert chunk
        const createdChunk = await prisma.documentChunk.create({
          data: {
            documentId,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            pageNumber: chunk.pageNumber ?? 1,
            tokenCount: chunk.tokenCount,
          },
        });

        // If pgvector is enabled and embeddingVector exists, update raw vector column
        if (embeddingVector.length > 0) {
          try {
            const vectorString = `[${embeddingVector.join(',')}]`;
            await prisma.$executeRawUnsafe(
              `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
              vectorString,
              createdChunk.id
            );
          } catch (rawSqlErr) {
            // If pgvector extension is not enabled in the current database instance, continue gracefully
            logger.debug('Raw vector storage skipped (pgvector extension might not be active):', rawSqlErr);
          }
        }
      }

      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.READY,
          pageCount: parsed.pageCount,
        },
      });

      logger.info(`Successfully ingested document ${documentId} with ${parsed.chunks.length} chunks.`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown ingestion failure';
      logger.error(`Document ingestion failed for ${documentId}:`, errorMessage);

      // Clean up partial chunks on failure
      try {
        await prisma.documentChunk.deleteMany({
          where: { documentId },
        });
      } catch {
        // Ignore cleanup failure
      }

      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.FAILED,
          errorMessage: errorMessage.slice(0, 500),
        },
      });
    }
  }
}
