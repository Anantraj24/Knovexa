import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../repositories/prisma.js';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';
import { IngestService } from '../processing/ingest.service.js';

export interface CreateDocumentInput {
  userId: string;
  name: string;
  originalName: string;
  type: DocumentType;
  mimeType: string;
  sizeBytes: bigint;
  storagePath: string;
}

export class DocumentService {
  static async listDocuments(userId: string, options: { page?: number; pageSize?: number; status?: DocumentStatus; search?: string }) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: {
      userId: string;
      status?: DocumentStatus;
      name?: { contains: string; mode: 'insensitive' };
    } = { userId };

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.name = { contains: options.search, mode: 'insensitive' };
    }

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { chunks: true },
          },
        },
      }),
    ]);

    return {
      documents: documents.map((doc) => ({
        ...doc,
        sizeBytes: doc.sizeBytes.toString(),
        chunkCount: doc._count.chunks,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  static async getDocumentById(userId: string, documentId: string) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
      include: {
        _count: {
          select: { chunks: true, collections: true },
        },
      },
    });

    if (!document) {
      throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found or access denied.', 404);
    }

    return {
      ...document,
      sizeBytes: document.sizeBytes.toString(),
      chunkCount: document._count.chunks,
      collectionCount: document._count.collections,
    };
  }

  static async createDocument(input: CreateDocumentInput) {
    const document = await prisma.document.create({
      data: {
        userId: input.userId,
        name: input.name,
        originalName: input.originalName,
        type: input.type,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storagePath: input.storagePath,
        status: DocumentStatus.UPLOADED,
      },
    });

    // Trigger asynchronous ingestion pipeline
    setImmediate(() => {
      IngestService.processDocument(document.id).catch((err) => {
        console.error(`Background ingestion failed for document ${document.id}:`, err);
      });
    });

    return {
      ...document,
      sizeBytes: document.sizeBytes.toString(),
    };
  }

  static async deleteDocument(userId: string, documentId: string) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found or access denied.', 404);
    }

    // Delete database record (cascades to chunks, collectionDocument, etc.)
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Clean up physical file if it exists
    try {
      if (document.storagePath) {
        await fs.unlink(path.resolve(process.cwd(), document.storagePath));
      }
    } catch {
      // Ignore physical file deletion error if already unlinked
    }

    return { success: true };
  }

  static async reprocessDocument(userId: string, documentId: string) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found or access denied.', 404);
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: DocumentStatus.PROCESSING, errorMessage: null },
    });

    setImmediate(() => {
      IngestService.processDocument(document.id).catch((err) => {
        console.error(`Reprocessing failed for document ${document.id}:`, err);
      });
    });

    return { id: document.id, status: DocumentStatus.PROCESSING };
  }
}
