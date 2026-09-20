import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { ChatService } from '../services/chat/chat.service.js';
import { createConversationSchema, askQuestionSchema } from '../validators/chat.validator.js';

export class ChatController {
  static async listConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await ChatService.listConversations(req.user!.userId);
      res.status(200).json({
        data: conversations,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = createConversationSchema.parse(req.body);
      const conversation = await ChatService.createConversation(req.user!.userId, body);
      res.status(201).json({
        data: conversation,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await ChatService.getConversation(req.user!.userId, req.params.id);
      res.status(200).json({
        data: conversation,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await ChatService.deleteConversation(req.user!.userId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async askQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { question } = askQuestionSchema.parse(req.body);
      const result = await ChatService.askQuestion(req.user!.userId, req.params.id, question);
      res.status(200).json({
        data: result,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }
}
