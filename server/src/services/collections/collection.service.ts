import { prisma } from '../../repositories/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CollectionService {
  static async listCollections(userId: string) {
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return collections.map((c) => ({
      id: c.id,
      name: c.name,
      documentCount: c._count.documents,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  static async createCollection(userId: string, name: string) {
    const existing = await prisma.collection.findUnique({
      where: {
        userId_name: {
          userId,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      throw new AppError('COLLECTION_ALREADY_EXISTS', 'A collection with this name already exists.', 409);
    }

    const collection = await prisma.collection.create({
      data: {
        userId,
        name: name.trim(),
      },
    });

    return collection;
  }

  static async addDocumentToCollection(userId: string, collectionId: string, documentId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });
    if (!collection) {
      throw new AppError('COLLECTION_NOT_FOUND', 'Collection not found or access denied.', 404);
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });
    if (!document) {
      throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found or access denied.', 404);
    }

    await prisma.collectionDocument.upsert({
      where: {
        collectionId_documentId: {
          collectionId,
          documentId,
        },
      },
      update: {},
      create: {
        collectionId,
        documentId,
      },
    });

    return { success: true };
  }

  static async removeDocumentFromCollection(userId: string, collectionId: string, documentId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });
    if (!collection) {
      throw new AppError('COLLECTION_NOT_FOUND', 'Collection not found or access denied.', 404);
    }

    await prisma.collectionDocument.deleteMany({
      where: { collectionId, documentId },
    });

    return { success: true };
  }

  static async deleteCollection(userId: string, collectionId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });
    if (!collection) {
      throw new AppError('COLLECTION_NOT_FOUND', 'Collection not found or access denied.', 404);
    }

    await prisma.collection.delete({
      where: { id: collectionId },
    });

    return { success: true };
  }
}
