import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

export const documentRouter = Router();

documentRouter.use(authenticate);

documentRouter.get('/', DocumentController.list);
documentRouter.post('/', uploadMiddleware.single('file'), DocumentController.upload);
documentRouter.get('/:id', DocumentController.getById);
documentRouter.delete('/:id', DocumentController.delete);
documentRouter.post('/:id/reprocess', DocumentController.reprocess);
