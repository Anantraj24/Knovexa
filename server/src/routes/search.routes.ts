import { Router } from 'express';
import { SearchController } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.js';

export const searchRouter = Router();

searchRouter.post('/search', authenticate, SearchController.search);
