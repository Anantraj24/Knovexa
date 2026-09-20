import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get('/', ChatController.listConversations);
chatRouter.post('/', ChatController.createConversation);
chatRouter.get('/:id', ChatController.getConversation);
chatRouter.delete('/:id', ChatController.deleteConversation);
chatRouter.post('/:id/messages', ChatController.askQuestion);
