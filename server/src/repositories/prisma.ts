import { PrismaClient, UserRole, DocumentStatus, DocumentType, MessageRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';
import { generateId } from '../utils/id.js';

// Real Prisma Client
const realPrisma = new PrismaClient();

// In-Memory Storage Fallback when PostgreSQL is offline
class MemoryStore {
  users: any[] = [];
  refreshTokens: any[] = [];
  documents: any[] = [];
  documentChunks: any[] = [];
  collections: any[] = [];
  collectionDocuments: any[] = [];
  conversations: any[] = [];
  messages: any[] = [];
  citations: any[] = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const defaultPasswordHash = bcrypt.hashSync('UserPassword123!', 10);
    const adminPasswordHash = bcrypt.hashSync('AdminPassword123!', 10);

    const user = {
      id: 'usr_anant123',
      email: 'anant@knovexa.com',
      name: 'Anant Raj',
      passwordHash: defaultPasswordHash,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const admin = {
      id: 'usr_admin123',
      email: 'admin@knovexa.com',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user, admin);

    const col1 = {
      id: 'col_specs123',
      userId: user.id,
      name: 'Engineering Specs',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const col2 = {
      id: 'col_research123',
      userId: user.id,
      name: 'Research Papers',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.collections.push(col1, col2);

    const doc = {
      id: 'doc_overview123',
      userId: user.id,
      name: 'Knovexa Architecture Overview',
      originalName: 'knovexa-architecture.pdf',
      type: DocumentType.PDF,
      mimeType: 'application/pdf',
      sizeBytes: BigInt(245760),
      storagePath: 'storage/uploads/mock-architecture.pdf',
      status: DocumentStatus.READY,
      pageCount: 3,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.documents.push(doc);
    this.collectionDocuments.push({ collectionId: col1.id, documentId: doc.id });

    const chunk1 = {
      id: 'chk_1',
      documentId: doc.id,
      chunkIndex: 0,
      pageNumber: 1,
      tokenCount: 45,
      content: 'Knovexa transforms static documents into an interactive knowledge workspace combining full-stack engineering, semantic retrieval, RAG, citations, and search.',
      createdAt: new Date(),
    };

    const chunk2 = {
      id: 'chk_2',
      documentId: doc.id,
      chunkIndex: 1,
      pageNumber: 2,
      tokenCount: 55,
      content: 'Architecture principles: Node.js Express backend on port 4000, React 19 frontend on port 5173, PostgreSQL with pgvector, and provider-independent AI layer.',
      createdAt: new Date(),
    };

    this.documentChunks.push(chunk1, chunk2);

    const conv = {
      id: 'cnv_intro123',
      userId: user.id,
      documentId: doc.id,
      title: 'Knovexa Deployment Inquiries',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.push(conv);

    const m1 = {
      id: 'msg_1',
      conversationId: conv.id,
      role: MessageRole.USER,
      content: 'What is the recommended local port for the Express API?',
      createdAt: new Date(Date.now() - 60000),
    };

    const m2 = {
      id: 'msg_2',
      conversationId: conv.id,
      role: MessageRole.ASSISTANT,
      content: 'According to the architecture specification, the Express API runs on port 4000 for local development [1].',
      createdAt: new Date(),
    };

    this.messages.push(m1, m2);
    this.citations.push({
      id: 'cit_1',
      messageId: m2.id,
      chunkId: chunk2.id,
      position: 1,
    });
  }
}

const memory = new MemoryStore();
let isDatabaseAvailable = false;

// Probe database availability asynchronously
realPrisma.$queryRaw`SELECT 1`
  .then(() => {
    isDatabaseAvailable = true;
    logger.info('Connected to PostgreSQL successfully.');
  })
  .catch(() => {
    isDatabaseAvailable = false;
    logger.info('PostgreSQL connection unavailable. Operating in persistent In-Memory fallback mode.');
  });

export const prisma: any = new Proxy(realPrisma, {
  get(target, prop: string) {
    if (!isDatabaseAvailable) {
      if (prop === 'user') {
        return {
          findUnique: async ({ where }: any) => {
            if (where.email) return memory.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
            if (where.id) return memory.users.find((u) => u.id === where.id) || null;
            return null;
          },
          findFirst: async ({ where }: any) => {
            return memory.users.find((u) => (!where.id || u.id === where.id) && (!where.email || u.email === where.email)) || null;
          },
          create: async ({ data, select }: any) => {
            const newUser = { id: generateId('usr'), createdAt: new Date(), updatedAt: new Date(), role: UserRole.USER, ...data };
            memory.users.push(newUser);
            if (select) {
              const res: any = {};
              Object.keys(select).forEach((k) => { if (select[k]) res[k] = newUser[k]; });
              return res;
            }
            return newUser;
          },
          upsert: async ({ where, create, update }: any) => {
            const found = memory.users.find((u) => (where.email && u.email === where.email) || (where.id && u.id === where.id));
            if (found) {
              Object.assign(found, update, { updatedAt: new Date() });
              return found;
            }
            const created = { id: generateId('usr'), createdAt: new Date(), updatedAt: new Date(), ...create };
            memory.users.push(created);
            return created;
          },
        };
      }

      if (prop === 'refreshToken') {
        return {
          create: async ({ data }: any) => {
            const token = { id: generateId('tok'), createdAt: new Date(), ...data };
            memory.refreshTokens.push(token);
            return token;
          },
          deleteMany: async ({ where }: any) => {
            memory.refreshTokens = memory.refreshTokens.filter((t) => !where.userId || t.userId !== where.userId);
            return { count: 1 };
          },
        };
      }

      if (prop === 'document') {
        return {
          count: async ({ where }: any) => {
            return memory.documents.filter((d) => d.userId === where.userId && (!where.status || d.status === where.status)).length;
          },
          findMany: async ({ where, skip = 0, take = 20 }: any) => {
            let docs = memory.documents.filter((d) => d.userId === where.userId);
            if (where.status) docs = docs.filter((d) => d.status === where.status);
            if (where.name?.contains) {
              const q = where.name.contains.toLowerCase();
              docs = docs.filter((d) => d.name.toLowerCase().includes(q) || d.originalName.toLowerCase().includes(q));
            }
            return docs.slice(skip, skip + take).map((doc) => ({
              ...doc,
              _count: {
                chunks: memory.documentChunks.filter((c) => c.documentId === doc.id).length,
              },
            }));
          },
          findFirst: async ({ where }: any) => {
            const doc = memory.documents.find((d) => d.id === where.id && (!where.userId || d.userId === where.userId));
            if (!doc) return null;
            return {
              ...doc,
              _count: {
                chunks: memory.documentChunks.filter((c) => c.documentId === doc.id).length,
                collections: memory.collectionDocuments.filter((cd) => cd.documentId === doc.id).length,
              },
            };
          },
          findUnique: async ({ where }: any) => {
            return memory.documents.find((d) => d.id === where.id) || null;
          },
          create: async ({ data }: any) => {
            const doc = { id: generateId('doc'), createdAt: new Date(), updatedAt: new Date(), pageCount: 1, errorMessage: null, ...data };
            memory.documents.unshift(doc);
            return doc;
          },
          update: async ({ where, data }: any) => {
            const doc = memory.documents.find((d) => d.id === where.id);
            if (doc) {
              Object.assign(doc, data, { updatedAt: new Date() });
            }
            return doc;
          },
          delete: async ({ where }: any) => {
            memory.documents = memory.documents.filter((d) => d.id !== where.id);
            memory.documentChunks = memory.documentChunks.filter((c) => c.documentId !== where.id);
            memory.collectionDocuments = memory.collectionDocuments.filter((cd) => cd.documentId !== where.id);
            return { id: where.id };
          },
        };
      }

      if (prop === 'documentChunk') {
        return {
          findMany: async ({ where, take = 100 }: any) => {
            let chunks = memory.documentChunks;
            if (where?.document?.userId) {
              const userDocIds = new Set(memory.documents.filter((d) => d.userId === where.document.userId).map((d) => d.id));
              chunks = chunks.filter((c) => userDocIds.has(c.documentId));
            }
            if (where?.document?.id?.in) {
              const docIds = new Set(where.document.id.in);
              chunks = chunks.filter((c) => docIds.has(c.documentId));
            }
            return chunks.slice(0, take).map((c) => {
              const doc = memory.documents.find((d) => d.id === c.documentId);
              return {
                ...c,
                document: { id: doc?.id, name: doc?.name || 'Document' },
              };
            });
          },
          create: async ({ data }: any) => {
            const chunk = { id: generateId('chk'), createdAt: new Date(), ...data };
            memory.documentChunks.push(chunk);
            return chunk;
          },
          deleteMany: async ({ where }: any) => {
            memory.documentChunks = memory.documentChunks.filter((c) => !where.documentId || c.documentId !== where.documentId);
            return { count: 1 };
          },
        };
      }

      if (prop === 'collection') {
        return {
          findMany: async ({ where }: any) => {
            return memory.collections
              .filter((c) => c.userId === where.userId)
              .map((c) => ({
                ...c,
                _count: {
                  documents: memory.collectionDocuments.filter((cd) => cd.collectionId === c.id).length,
                },
              }));
          },
          findUnique: async ({ where }: any) => {
            if (where.userId_name) {
              return memory.collections.find((c) => c.userId === where.userId_name.userId && c.name === where.userId_name.name) || null;
            }
            return memory.collections.find((c) => c.id === where.id) || null;
          },
          findFirst: async ({ where }: any) => {
            return memory.collections.find((c) => c.id === where.id && (!where.userId || c.userId === where.userId)) || null;
          },
          create: async ({ data }: any) => {
            const col = { id: generateId('col'), createdAt: new Date(), updatedAt: new Date(), ...data };
            memory.collections.push(col);
            return col;
          },
          delete: async ({ where }: any) => {
            memory.collections = memory.collections.filter((c) => c.id !== where.id);
            memory.collectionDocuments = memory.collectionDocuments.filter((cd) => cd.collectionId !== where.id);
            return { id: where.id };
          },
        };
      }

      if (prop === 'collectionDocument') {
        return {
          upsert: async ({ create }: any) => {
            const cd = { ...create };
            memory.collectionDocuments.push(cd);
            return cd;
          },
          deleteMany: async ({ where }: any) => {
            memory.collectionDocuments = memory.collectionDocuments.filter((cd) => cd.collectionId !== where.collectionId || cd.documentId !== where.documentId);
            return { count: 1 };
          },
        };
      }

      if (prop === 'conversation') {
        return {
          findMany: async ({ where }: any) => {
            return memory.conversations
              .filter((c) => c.userId === where.userId)
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .map((c) => {
                const doc = c.documentId ? memory.documents.find((d) => d.id === c.documentId) : null;
                return {
                  ...c,
                  document: doc ? { id: doc.id, name: doc.name, type: doc.type } : null,
                  _count: {
                    messages: memory.messages.filter((m) => m.conversationId === c.id).length,
                  },
                };
              });
          },
          findFirst: async ({ where }: any) => {
            const c = memory.conversations.find((conv) => conv.id === where.id && (!where.userId || conv.userId === where.userId));
            if (!c) return null;
            const doc = c.documentId ? memory.documents.find((d) => d.id === c.documentId) : null;
            const messages = memory.messages
              .filter((m) => m.conversationId === c.id)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((m) => {
                const citations = memory.citations
                  .filter((cit) => cit.messageId === m.id)
                  .map((cit) => {
                    const chk = memory.documentChunks.find((ch) => ch.id === cit.chunkId);
                    const chkDoc = chk ? memory.documents.find((d) => d.id === chk.documentId) : null;
                    return {
                      ...cit,
                      chunk: {
                        ...chk,
                        document: { id: chkDoc?.id, name: chkDoc?.name || 'Document' },
                      },
                    };
                  });
                return { ...m, citations };
              });

            return {
              ...c,
              document: doc ? { id: doc.id, name: doc.name, type: doc.type } : null,
              messages,
            };
          },
          create: async ({ data }: any) => {
            const conv = { id: generateId('cnv'), createdAt: new Date(), updatedAt: new Date(), ...data };
            memory.conversations.unshift(conv);
            const doc = conv.documentId ? memory.documents.find((d) => d.id === conv.documentId) : null;
            return {
              ...conv,
              document: doc ? { id: doc.id, name: doc.name, type: doc.type } : null,
            };
          },
          update: async ({ where, data }: any) => {
            const conv = memory.conversations.find((c) => c.id === where.id);
            if (conv) Object.assign(conv, data, { updatedAt: new Date() });
            return conv;
          },
          delete: async ({ where }: any) => {
            memory.conversations = memory.conversations.filter((c) => c.id !== where.id);
            memory.messages = memory.messages.filter((m) => m.conversationId !== where.id);
            return { id: where.id };
          },
        };
      }

      if (prop === 'message') {
        return {
          create: async ({ data }: any) => {
            const msg = { id: generateId('msg'), createdAt: new Date(), ...data };
            memory.messages.push(msg);
            return msg;
          },
        };
      }

      if (prop === 'citation') {
        return {
          create: async ({ data }: any) => {
            const cit = { id: generateId('cit'), ...data };
            memory.citations.push(cit);
            return cit;
          },
        };
      }

      if (prop === '$queryRaw' || prop === '$queryRawUnsafe') {
        return async () => [];
      }

      if (prop === '$executeRawUnsafe') {
        return async () => 1;
      }
    }

    return (target as any)[prop];
  },
});
