import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AuthService } from '../services/auth/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated);
      res.status(201).json({
        data: result,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      res.status(200).json({
        data: result,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await AuthService.logout(req.user.userId);
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getCurrentUser(req.user!.userId);
      res.status(200).json({
        data: user,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }
}
