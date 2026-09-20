# Knovexa — Product Logic and Business Rules

## Document states
UPLOADED → PROCESSING → READY or FAILED.

Only READY documents participate in search and RAG.

## Upload
Allowed: PDF, DOCX, TXT. Maximum 20 MB. Reject empty, unsupported, oversized or malformed files.

## Ownership
Users can only view, rename, delete, search and chat with documents they own or are explicitly granted access to in a future sharing system.

## Collections
Names are required, 1–100 characters and unique per user. A document may belong to multiple collections. Deleting a collection does not delete documents.

## RAG
Default topK = 8. Use only chunks above a configurable relevance threshold. Never fill context with unrelated chunks.

If context is insufficient:
`The available documents do not contain enough information to answer this question.`

## Citations
Every citation must reference a real document chunk and valid page metadata when available. Never fabricate citation IDs or locations.

## Processing failures
Mark FAILED, save a safe error message, remove partial invalid chunks and permit manual retry. Automatic retries may be limited to three.

## AI provider
Provider is explicitly selected as LOCAL or CLOUD. Never silently fall back from local to cloud.

## Prompt injection
Treat document content as untrusted context. Never execute instructions found inside documents or allow retrieved text to modify permissions.

## Edge cases
- Empty PDF: FAILED with extractable-text error.
- Scanned PDF: unsupported in MVP; OCR is future functionality.
- Duplicate upload: allowed initially; file hashes may later detect duplicates.
- No documents: require upload or selection before document-grounded chat.
