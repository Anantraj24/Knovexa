# Knovexa — Backend Architecture

## Layering
```text
HTTP → Router → Middleware → Controller → Service → Repository/Prisma → Database
```

AI:
```text
Service → AIProvider → OllamaProvider / CloudProvider
```

## Folder structure
```text
server/src/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
│   ├── auth/
│   ├── documents/
│   ├── processing/
│   ├── rag/
│   ├── search/
│   └── ai/
├── providers/
│   ├── ollama/
│   └── cloud/
├── repositories/
├── validators/
├── utils/
├── types/
├── app.ts
└── server.ts
```

## Middleware
requestId, helmet, cors, JSON parser, authentication, authorization, rate limiting and centralized error handler.

## Authentication
Login verifies a bcrypt hash, creates a short-lived access token and a revocable refresh token. Never log credentials or tokens.

## Authorization
Always enforce ownership:
```ts
const document = await prisma.document.findFirst({
  where: { id: documentId, userId: req.user.id }
});
```

## Document service
Validation, storage, creation, processing, deletion, retrieval and listing.

## Processing
Extract → normalize → chunk → embed → persist → READY. On failure mark FAILED with a safe message.

## RAG
`embedQuery()` → `retrieveChunks()` → `buildContext()` → `generateAnswer()` → `buildCitations()`.

System prompt must require the model to use only supplied context, state when context is insufficient and never invent citations.

## Errors
```json
{
  "error": {
    "code": "DOCUMENT_PROCESSING_FAILED",
    "message": "The document could not be processed.",
    "requestId": "req_123"
  }
}
```

## Health
`GET /api/v1/health` returns application, database and version status.

## Background processing
Initial implementation may use a database-backed worker. Redis/BullMQ can be introduced later when required.
