import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller.js';
import { authenticate } from '../middleware/auth.js';

export const collectionRouter = Router();

collectionRouter.use(authenticate);

collectionRouter.get('/', CollectionController.list);
collectionRouter.post('/', CollectionController.create);
collectionRouter.post('/:id/documents/:documentId', CollectionController.addDocument);
collectionRouter.delete('/:id/documents/:documentId', CollectionController.removeDocument);
collectionRouter.delete('/:id', CollectionController.delete);
