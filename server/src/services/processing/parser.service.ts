import fs from 'fs/promises';
import { DocumentType } from '@prisma/client';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { AppError } from '../../middleware/errorHandler.js';
import { normalizeText } from './normalizer.js';
import { chunkText, ChunkOutput } from './chunker.js';

export interface ParsedDocumentResult {
  text: string;
  pageCount: number;
  chunks: ChunkOutput[];
}

export class ParserService {
  static async parseFile(filePath: string, type: DocumentType): Promise<ParsedDocumentResult> {
    const fileBuffer = await fs.readFile(filePath);

    if (fileBuffer.length === 0) {
      throw new AppError('EMPTY_DOCUMENT', 'Uploaded file is empty (0 bytes).', 422);
    }

    switch (type) {
      case DocumentType.TXT:
        return this.parseTxt(fileBuffer);
      case DocumentType.DOCX:
        return this.parseDocx(fileBuffer);
      case DocumentType.PDF:
        return this.parsePdf(fileBuffer);
      default:
        throw new AppError('UNSUPPORTED_MEDIA_TYPE', `Unsupported document type: ${type}`, 415);
    }
  }

  private static parseTxt(buffer: Buffer): ParsedDocumentResult {
    const rawText = buffer.toString('utf-8');
    const text = normalizeText(rawText);
    const chunks = chunkText(text, { defaultPageNumber: 1 });
    return {
      text,
      pageCount: 1,
      chunks,
    };
  }

  private static async parseDocx(buffer: Buffer): Promise<ParsedDocumentResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = normalizeText(result.value);
      const chunks = chunkText(text, { defaultPageNumber: 1 });
      return {
        text,
        pageCount: 1,
        chunks,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new AppError('DOCUMENT_PARSING_FAILED', 'Failed to extract text from Word (.docx) document.', 422);
    }
  }

  private static async parsePdf(buffer: Buffer): Promise<ParsedDocumentResult> {
    try {
      const data = await pdfParse(buffer);
      if (!data.text || data.text.trim().length === 0) {
        throw new AppError('EXTRACTABLE_TEXT_ERROR', 'PDF contains no extractable text. Scanned PDFs are not supported in MVP.', 422);
      }

      const text = normalizeText(data.text);
      const pageCount = data.numpages || 1;
      const chunks = chunkText(text, { defaultPageNumber: 1 });

      return {
        text,
        pageCount,
        chunks,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new AppError('DOCUMENT_PARSING_FAILED', 'Failed to parse PDF document structure.', 422);
    }
  }
}
