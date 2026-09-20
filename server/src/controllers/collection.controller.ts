import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { CollectionService } from '../services/collections/collection.service.js';
import { createCollectionSchema } from '../validators/document.validator.js';

export class CollectionController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const collections = await CollectionService.listCollections(req.user!.userId);
      res.status(200).json({
        data: collections,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = createCollectionSchema.parse(req.body);
      const collection = await CollectionService.createCollection(req.user!.userId, name);
      res.status(201).json({
        data: collection,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async addDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CollectionService.addDocumentToCollection(
        req.user!.userId,
        req.params.id,
        req.params.documentId
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async removeDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CollectionService.removeDocumentFromCollection(
        req.user!.userId,
        req.params.id,
        req.params.documentId
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CollectionService.deleteCollection(req.user!.userId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
