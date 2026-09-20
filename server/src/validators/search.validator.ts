import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
  documentIds: z.array(z.string()).optional().default([]),
  collectionId: z.string().optional(),
  limit: z.number().int().positive().max(50).default(10),
});
