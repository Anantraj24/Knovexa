import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { SearchService } from '../services/search/search.service.js';
import { searchSchema } from '../validators/search.validator.js';

export class SearchController {
  static async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { query, documentIds, limit } = searchSchema.parse(req.body);
      const results = await SearchService.search({
        userId: req.user!.userId,
        query,
        documentIds,
        limit,
      });

      res.status(200).json({
        data: results,
        meta: { total: results.length, requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  }
}
