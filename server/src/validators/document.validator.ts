import { z } from 'zod';
import { DocumentStatus } from '@prisma/client';

export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(DocumentStatus).optional(),
  search: z.string().optional(),
});

export const renameDocumentSchema = z.object({
  name: z.string().min(1, 'Document name cannot be empty').max(255),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100),
});
