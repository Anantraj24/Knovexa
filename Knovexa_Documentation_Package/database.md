# Knovexa — Database Specification

## PostgreSQL
PostgreSQL 16+ with pgvector.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Prisma schema
```prisma
enum UserRole { USER ADMIN }
enum DocumentStatus { UPLOADED PROCESSING READY FAILED }
enum DocumentType { PDF DOCX TXT }
enum MessageRole { USER ASSISTANT SYSTEM }

model User {
  id String @id @default(cuid())
  email String @unique
  passwordHash String
  name String
  role UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  documents Document[]
  collections Collection[]
  conversations Conversation[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id String @id @default(cuid())
  tokenHash String @unique
  userId String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model Document {
  id String @id @default(cuid())
  userId String
  name String
  originalName String
  type DocumentType
  mimeType String
  sizeBytes BigInt
  storagePath String
  status DocumentStatus @default(UPLOADED)
  pageCount Int?
  errorMessage String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  chunks DocumentChunk[]
  collections CollectionDocument[]
  conversations Conversation[]
  @@index([userId])
  @@index([userId, status])
}

model DocumentChunk {
  id String @id @default(cuid())
  documentId String
  chunkIndex Int
  content String
  pageNumber Int?
  tokenCount Int?
  embedding Unsupported("vector(1536)")?
  createdAt DateTime @default(now())
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  citations Citation[]
  @@unique([documentId, chunkIndex])
  @@index([documentId])
}

model Collection {
  id String @id @default(cuid())
  userId String
  name String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  documents CollectionDocument[]
  @@unique([userId, name])
  @@index([userId])
}

model CollectionDocument {
  collectionId String
  documentId String
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  @@id([collectionId, documentId])
}

model Conversation {
  id String @id @default(cuid())
  userId String
  documentId String?
  title String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  document Document? @relation(fields: [documentId], references: [id], onDelete: SetNull)
  messages Message[]
  @@index([userId])
}

model Message {
  id String @id @default(cuid())
  conversationId String
  role MessageRole
  content String
  createdAt DateTime @default(now())
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  citations Citation[]
  @@index([conversationId, createdAt])
}

model Citation {
  id String @id @default(cuid())
  messageId String
  chunkId String
  position Int
  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  chunk DocumentChunk @relation(fields: [chunkId], references: [id], onDelete: Cascade)
  @@index([messageId])
}
```

## ERD
```text
USER
 ├── DOCUMENT ──< DOCUMENT_CHUNK
 ├── COLLECTION ──< COLLECTION_DOCUMENT >── DOCUMENT
 └── CONVERSATION ──< MESSAGE ──< CITATION >── DOCUMENT_CHUNK
```

## Migrations
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

Seed one admin, one user, metadata-only example documents, two collections and one example conversation. Never seed private documents.

Vector search should use cosine distance with parameterized SQL. Keep embedding dimensions consistent with the configured model.
