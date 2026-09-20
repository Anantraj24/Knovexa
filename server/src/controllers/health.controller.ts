import { Request, Response } from 'express';
import { prisma } from '../repositories/prisma.js';
import { config } from '../config/index.js';

export class HealthController {
  static async check(_req: Request, res: Response) {
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unreachable';
    }

    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      application: 'Knovexa API',
      version: '0.1.0',
      database: dbStatus,
      aiProvider: config.ai.provider,
      timestamp: new Date().toISOString(),
    };

    const statusCode = dbStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json({ data: health });
  }
}
