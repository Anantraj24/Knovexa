import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  id?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
}

export interface ChunkMetadata {
  pageNumber?: number;
  tokenCount?: number;
  chunkIndex: number;
}

export interface GenerateAnswerInput {
  question: string;
  context: string;
  systemPrompt?: string;
}

export interface GenerateAnswerOutput {
  answer: string;
  tokensUsed?: number;
}

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  pageNumber: number | null;
  content: string;
  score: number;
}

export interface CitationItem {
  id?: string;
  messageId?: string;
  chunkId: string;
  position: number;
  documentId?: string;
  documentName?: string;
  pageNumber?: number | null;
  excerpt?: string;
}
