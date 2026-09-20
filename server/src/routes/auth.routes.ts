import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/auth/register', AuthController.register);
authRouter.post('/auth/login', AuthController.login);
authRouter.post('/auth/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);
