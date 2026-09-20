# Knovexa — Master Project Plan

> Turn Documents Into Knowledge.
> AI Document Intelligence & RAG Platform

## Objective
Build a production-quality platform for authenticated users to upload documents, parse them, chunk and embed content, search semantically, ask grounded questions, and receive answers with citations.

## Architecture principles
- TypeScript across frontend and backend.
- React + Vite frontend.
- Node.js + Express backend.
- PostgreSQL + Prisma.
- pgvector for vector search.
- JWT authentication and RBAC.
- Provider-independent AI layer.
- Local Ollama mode and cloud AI mode.
- Asynchronous document processing.
- Centralized validation and error handling.
- Automated tests and Docker-based development.

## Phases
1. Foundation — repository, TypeScript, linting, Docker, PostgreSQL.
2. Database — Prisma schema, migrations, seeds, pgvector.
3. Authentication — registration, login, logout, JWT, authorization.
4. Document management — upload, metadata, storage, collections.
5. Processing — PDF/DOCX/TXT extraction, normalization, chunking.
6. Embeddings — provider abstraction, local embeddings, cloud embeddings.
7. RAG — retrieval, context construction, grounded generation, citations.
8. Chat — persistent conversations, streaming, citations.
9. Search — semantic and keyword search, filters.
10. UI/UX — responsive premium SaaS interface.
11. Testing — unit, integration and E2E.
12. Deployment — frontend, backend, database, storage and AI configuration.

## Milestones
| ID | Milestone | Deliverable |
|---|---|---|
| M1 | Foundation | Running local stack |
| M2 | Database | Migrated Prisma schema |
| M3 | Auth | Protected API |
| M4 | Documents | Upload and management |
| M5 | Processing | Indexed documents |
| M6 | RAG | Grounded answers |
| M7 | Chat | Persistent conversations |
| M8 | Search | Semantic search |
| M9 | Quality | Automated tests |
| M10 | Release | Production deployment |

## Definition of Done
- Authentication works.
- Supported files upload successfully.
- Documents process asynchronously.
- Vectors are indexed.
- RAG answers use retrieved context.
- Citations map to real source chunks.
- Ownership checks prevent unauthorized access.
- Search works.
- Tests cover critical workflows.
- Production configuration contains no committed secrets.

## Implementation order
Foundation → Database → Auth → Document CRUD → Storage → Parsing → Chunking → Embeddings → Vector Search → RAG → Chat → Search → UI polish → Testing → Deployment.
