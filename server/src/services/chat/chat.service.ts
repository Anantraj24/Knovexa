import { prisma } from '../../repositories/prisma.js';
import { MessageRole } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';
import { RAGService } from '../rag/rag.service.js';

export class ChatService {
  static async listConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        document: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      documentId: c.documentId,
      document: c.document,
      messageCount: c._count.messages,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  static async createConversation(userId: string, input: { title: string; documentId?: string | null }) {
    if (input.documentId) {
      const document = await prisma.document.findFirst({
        where: { id: input.documentId, userId },
      });
      if (!document) {
        throw new AppError('DOCUMENT_NOT_FOUND', 'Specified document was not found or access denied.', 404);
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: input.title,
        documentId: input.documentId || null,
      },
      include: {
        document: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return conversation;
  }

  static async getConversation(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        document: {
          select: { id: true, name: true, type: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            citations: {
              include: {
                chunk: {
                  include: {
                    document: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new AppError('CONVERSATION_NOT_FOUND', 'Conversation not found or access denied.', 404);
    }

    return {
      id: conversation.id,
      title: conversation.title,
      documentId: conversation.documentId,
      document: conversation.document,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
        citations: m.citations.map((c) => ({
          id: c.id,
          position: c.position,
          chunkId: c.chunkId,
          documentId: c.chunk.document.id,
          documentName: c.chunk.document.name,
          pageNumber: c.chunk.pageNumber,
          contentExcerpt: c.chunk.content.slice(0, 250),
        })),
      })),
    };
  }

  static async deleteConversation(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new AppError('CONVERSATION_NOT_FOUND', 'Conversation not found or access denied.', 404);
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { success: true };
  }

  static async askQuestion(userId: string, conversationId: string, question: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new AppError('CONVERSATION_NOT_FOUND', 'Conversation not found or access denied.', 404);
    }

    // 1. Record User Message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.USER,
        content: question,
      },
    });

    // 2. Run RAG Pipeline
    const documentIds = conversation.documentId ? [conversation.documentId] : [];
    const ragResult = await RAGService.generateAnswer(userId, question, documentIds);

    // 3. Record Assistant Message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.ASSISTANT,
        content: ragResult.answer,
      },
    });

    // 4. Record Citations in Database
    const createdCitations = [];
    for (const citation of ragResult.citations) {
      const rec = await prisma.citation.create({
        data: {
          messageId: assistantMessage.id,
          chunkId: citation.chunkId,
          position: citation.position,
        },
      });
      createdCitations.push({
        id: rec.id,
        position: citation.position,
        chunkId: citation.chunkId,
        documentId: citation.documentId,
        documentName: citation.documentName,
        pageNumber: citation.pageNumber,
        contentExcerpt: citation.excerpt,
      });
    }

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage,
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
        citations: createdCitations,
      },
    };
  }
}
