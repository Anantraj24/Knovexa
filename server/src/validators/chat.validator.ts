import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200),
  documentId: z.string().optional().nullable(),
});

export const askQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  stream: z.boolean().optional().default(false),
});
