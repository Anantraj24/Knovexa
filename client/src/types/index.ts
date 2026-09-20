export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
export type DocumentType = 'PDF' | 'DOCX' | 'TXT';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  originalName: string;
  type: DocumentType;
  mimeType: string;
  sizeBytes: string;
  status: DocumentStatus;
  pageCount: number | null;
  errorMessage: string | null;
  chunkCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CitationItem {
  id?: string;
  chunkId: string;
  position: number;
  documentId?: string;
  documentName?: string;
  pageNumber?: number | null;
  contentExcerpt?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  citations?: CitationItem[];
}

export interface Conversation {
  id: string;
  title: string;
  documentId?: string | null;
  document?: {
    id: string;
    name: string;
    type: DocumentType;
  } | null;
  messageCount?: number;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  pageNumber: number | null;
  score: number;
  excerpt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}
