import { RetrievalService } from './retrieval.service.js';
import { getAIProvider } from '../../providers/index.js';
import { config } from '../../config/index.js';
import { CitationItem, RetrievedChunk } from '../../types/index.js';

export interface RAGAnswerResult {
  answer: string;
  citations: CitationItem[];
  retrievedChunks: RetrievedChunk[];
}

export class RAGService {
  static async generateAnswer(userId: string, question: string, documentIds?: string[]): Promise<RAGAnswerResult> {
    const chunks = await RetrievalService.retrieveChunks({
      userId,
      query: question,
      documentIds,
      limit: config.rag.topK,
    });

    // If no chunks retrieved or all scores are 0, return fallback
    if (chunks.length === 0 || chunks.every((c) => c.score === 0)) {
      return {
        answer: config.rag.insufficientContextMessage,
        citations: [],
        retrievedChunks: [],
      };
    }

    // Build context with indexed citations
    const contextLines = chunks.map((chunk, index) => {
      const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
      return `[Chunk ${index + 1}] Source: "${chunk.documentName}"${pageInfo}\n${chunk.content}`;
    });

    const context = contextLines.join('\n\n---\n\n');

    const systemPrompt = `You are Knovexa, an intelligent document analysis assistant.
Your job is to provide accurate, concise, and helpful answers strictly based on the provided document context.

Rules:
1. ONLY use facts directly supported by the context below.
2. If the context does not provide sufficient information to answer the question, respond exactly with: "${config.rag.insufficientContextMessage}".
3. Always cite your sources using inline numeric tags like [1], [2] corresponding to the [Chunk 1], [Chunk 2] numbers in the context.
4. Never invent citations, URLs, or facts not present in the context.`;

    const provider = getAIProvider();
    const result = await provider.generateAnswer({
      question,
      context,
      systemPrompt,
    });

    // Extract citation numbers from the answer text
    const citationMatches = result.answer.match(/\[(\d+)\]/g) || [];
    const citedIndices = new Set<number>();
    citationMatches.forEach((m) => {
      const num = parseInt(m.replace(/[[\]]/g, ''), 10);
      if (num >= 1 && num <= chunks.length) {
        citedIndices.add(num);
      }
    });

    // Build citations list
    const citations: CitationItem[] = [];
    citedIndices.forEach((pos) => {
      const chunk = chunks[pos - 1];
      if (chunk) {
        citations.push({
          chunkId: chunk.id,
          position: pos,
          documentId: chunk.documentId,
          documentName: chunk.documentName,
          pageNumber: chunk.pageNumber,
          excerpt: chunk.content.slice(0, 200),
        });
      }
    });

    return {
      answer: result.answer,
      citations,
      retrievedChunks: chunks,
    };
  }
}
