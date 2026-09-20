import { Response, NextFunction } from 'express';
import path from 'path';
import { AuthenticatedRequest } from '../types/index.js';
import { DocumentService } from '../services/documents/document.service.js';
import { listDocumentsQuerySchema } from '../validators/document.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { DocumentType } from '@prisma/client';

export class DocumentController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = listDocumentsQuerySchema.parse(req.query);
      const result = await DocumentService.listDocuments(req.user!.userId, query);
      res.status(200).json({
        data: result.documents,
        meta: { ...result.pagination, requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async upload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        throw new AppError('MISSING_FILE', 'No document file was uploaded.', 400);
      }

      const ext = path.extname(file.originalname).toLowerCase();
      let type: DocumentType;
      if (ext === '.pdf') type = DocumentType.PDF;
      else if (ext === '.docx') type = DocumentType.DOCX;
      else if (ext === '.txt') type = DocumentType.TXT;
      else {
        throw new AppError('UNSUPPORTED_MEDIA_TYPE', 'Unsupported document format.', 415);
      }

      const relativePath = path.relative(process.cwd(), file.path);

      const document = await DocumentService.createDocument({
        userId: req.user!.userId,
        name: req.body.name?.trim() || file.originalname,
        originalName: file.originalname,
        type,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        storagePath: relativePath,
      });

      res.status(201).json({
        data: document,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const document = await DocumentService.getDocumentById(req.user!.userId, req.params.id);
      res.status(200).json({
        data: document,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await DocumentService.deleteDocument(req.user!.userId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async reprocess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DocumentService.reprocessDocument(req.user!.userId, req.params.id);
      res.status(200).json({
        data: result,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }
}
