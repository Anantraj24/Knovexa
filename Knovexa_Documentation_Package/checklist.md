# Knovexa — Master Implementation Checklist

Each task must be completed in one focused session and checked against its acceptance criteria.

| ID | Status | Task | Dependencies | Effort | Acceptance criteria |
|---|:---:|---|---|---:|---|
| KNV-001 | [x] | Initialize repository | None | 30m | Git repo, folders, README and gitignore exist |
| KNV-002 | [x] | Configure TypeScript | 001 | 30m | Strict mode and successful compile |
| KNV-003 | [x] | Configure lint/format | 002 | 30m | ESLint and Prettier run |
| KNV-004 | [x] | Configure Docker / PostgreSQL connection | 001 | 30m | DB connection and graceful fallback configured |
| KNV-005 | [x] | Configure Prisma | 004 | 30m | Client generates and DB connects |
| KNV-006 | [x] | Implement User schema | 005 | 45m | User model, unique email, relations |
| KNV-007 | [x] | Implement Document schema | 006 | 45m | Owner, status and file metadata |
| KNV-008 | [x] | Implement Chunk/vector schema | 007 | 60m | Chunks, vector field and indexes |
| KNV-009 | [x] | Implement registration | 006 | 60m | Valid registration works; duplicates rejected |
| KNV-010 | [x] | Implement login | 009 | 60m | Credentials produce access token |
| KNV-011 | [x] | Implement auth middleware | 010 | 45m | Protected routes reject invalid tokens |
| KNV-012 | [x] | Implement upload validation | 011 | 60m | PDF/DOCX/TXT, 20MB limit and MIME validation |
| KNV-013 | [x] | Implement document creation | 012 | 45m | Metadata and owner persist |
| KNV-014 | [x] | Implement document listing | 013 | 45m | Ownership, pagination and sorting work |
| KNV-015 | [x] | Implement document deletion | 014 | 45m | Owner deletion and cascading cleanup work |
| KNV-016 | [x] | Implement PDF extraction | 013 | 90m | Text and page metadata extracted |
| KNV-017 | [x] | Implement DOCX extraction | 016 | 60m | DOCX text extraction works |
| KNV-018 | [x] | Implement normalization | 016 | 45m | Whitespace normalized and empty text rejected |
| KNV-019 | [x] | Implement chunking | 018 | 90m | Deterministic chunks with metadata |
| KNV-020 | [x] | Implement AI provider interface | 019 | 60m | Common provider interface exists |
| KNV-021 | [x] | Implement Ollama provider | 020 | 90m | Local embedding and answer generation work |
| KNV-022 | [x] | Implement cloud/mock provider | 020 | 90m | Same interface works with test/cloud driver |
| KNV-023 | [x] | Implement vector indexing | 021 | 90m | Embeddings persist and similarity query works |
| KNV-024 | [x] | Implement retrieval service | 023 | 90m | Top-K relevant owned chunks returned |
| KNV-025 | [x] | Implement RAG generation | 024 | 120m | Grounded answers generated from context |
| KNV-026 | [x] | Implement conversation API | 025 | 90m | Conversations/messages persist securely |
| KNV-027 | [x] | Implement citations | 026 | 90m | Citations map to real chunks |
| KNV-028 | [x] | Implement chat frontend | 027 | 120m | Chat, loading, citations, and error states |
| KNV-029 | [x] | Implement semantic search | 024 | 90m | Natural-language search returns ranked results |
| KNV-030 | [x] | Implement filters | 029 | 60m | Collection/type/status filters work |
| KNV-031 | [x] | Implement collections | 014 | 90m | Create and manage document membership |
| KNV-032 | [x] | Implement application shell | 010 | 90m | Responsive navigation works |
| KNV-033 | [x] | Implement document UI | 014 | 120m | List, upload, status, empty/error states |
| KNV-034 | [x] | Implement settings | 010 | 60m | Profile, provider display and logout |
| KNV-035 | [x] | Add automated tests | 025 | 120m | Unit and API tests cover core services |
| KNV-036 | [x] | Add E2E workflow | 035 | 120m | Register→upload→process→chat→citation passes |
| KNV-037 | [x] | Production hardening | 036 | 120m | Rate limiting, CORS, security headers, safe errors |
| KNV-038 | [ ] | Deployment | 037 | 120m | Frontend/backend/database production deployment |
| KNV-039 | [x] | Documentation/release | 038 | 90m | README, API, architecture and clean setup |
| KNV-040 | [x] | Portfolio audit | 039 | 60m | No broken features, secrets or inaccurate claims |

References: see `plan.md`, `database.md`, `frontend.md`, `backend.md`, `architecture.md`, `api.md`, `testing.md`.
