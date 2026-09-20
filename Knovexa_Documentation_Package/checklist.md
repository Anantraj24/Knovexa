# Knovexa — Master Implementation Checklist

Each task must be completed in one focused session and checked against its acceptance criteria.

| ID | Task | Dependencies | Effort | Acceptance criteria |
|---|---|---|---:|---|
| KNV-001 | Initialize repository | None | 30m | Git repo, folders, README and gitignore exist |
| KNV-002 | Configure TypeScript | 001 | 30m | Strict mode and successful compile |
| KNV-003 | Configure lint/format | 002 | 30m | ESLint and Prettier run |
| KNV-004 | Configure Docker PostgreSQL | 001 | 30m | DB starts and accepts connections |
| KNV-005 | Configure Prisma | 004 | 30m | Client generates and DB connects |
| KNV-006 | Implement User schema | 005 | 45m | User model, unique email, migration |
| KNV-007 | Implement Document schema | 006 | 45m | Owner, status and file metadata |
| KNV-008 | Implement Chunk/vector schema | 007 | 60m | Chunks, vector field and indexes |
| KNV-009 | Implement registration | 006 | 60m | Valid registration works; duplicates rejected |
| KNV-010 | Implement login | 009 | 60m | Credentials produce access token |
| KNV-011 | Implement auth middleware | 010 | 45m | Protected routes reject invalid tokens |
| KNV-012 | Implement upload validation | 011 | 60m | PDF/DOCX/TXT, 20MB limit and MIME validation |
| KNV-013 | Implement document creation | 012 | 45m | Metadata and owner persist |
| KNV-014 | Implement document listing | 013 | 45m | Ownership, pagination and sorting work |
| KNV-015 | Implement document deletion | 014 | 45m | Owner deletion and cascading cleanup work |
| KNV-016 | Implement PDF extraction | 013 | 90m | Text and page metadata extracted |
| KNV-017 | Implement DOCX extraction | 016 | 60m | DOCX text extraction works |
| KNV-018 | Implement normalization | 016 | 45m | Whitespace normalized and empty text rejected |
| KNV-019 | Implement chunking | 018 | 90m | Deterministic chunks with metadata |
| KNV-020 | Implement AI provider interface | 019 | 60m | Common provider interface exists |
| KNV-021 | Implement Ollama provider | 020 | 90m | Local embedding and answer generation work |
| KNV-022 | Implement cloud provider | 020 | 90m | Same interface works with cloud credentials |
| KNV-023 | Implement vector indexing | 021 | 90m | Embeddings persist and similarity query works |
| KNV-024 | Implement retrieval service | 023 | 90m | Top-K relevant owned chunks returned |
| KNV-025 | Implement RAG generation | 024 | 120m | Grounded answers generated from context |
| KNV-026 | Implement conversation API | 025 | 90m | Conversations/messages persist securely |
| KNV-027 | Implement citations | 026 | 90m | Citations map to real chunks |
| KNV-028 | Implement chat frontend | 027 | 120m | Chat, loading and errors work |
| KNV-029 | Implement semantic search | 024 | 90m | Natural-language search returns ranked results |
| KNV-030 | Implement filters | 029 | 60m | Collection/type/status filters work |
| KNV-031 | Implement collections | 014 | 90m | Create and manage document membership |
| KNV-032 | Implement application shell | 010 | 90m | Responsive navigation works |
| KNV-033 | Implement document UI | 014 | 120m | List, upload, status, empty/error states |
| KNV-034 | Implement settings | 010 | 60m | Profile, provider display and logout |
| KNV-035 | Add automated tests | 025 | 120m | Unit and API tests cover core services |
| KNV-036 | Add E2E workflow | 035 | 120m | Register→upload→process→chat→citation passes |
| KNV-037 | Production hardening | 036 | 120m | Rate limiting, CORS, security headers, safe errors |
| KNV-038 | Deployment | 037 | 120m | Frontend/backend/database production deployment |
| KNV-039 | Documentation/release | 038 | 90m | README, API, architecture and clean setup |
| KNV-040 | Portfolio audit | 039 | 60m | No broken features, secrets or inaccurate claims |

References: see `plan.md`, `database.md`, `frontend.md`, `backend.md`, `architecture.md`, `api.md`, `testing.md`.
