# Knovexa — Technology Stack

## Frontend
- React 19.x
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

Create:
```bash
npm create vite@latest client -- --template react-ts
```

## Backend
- Node.js 22 LTS
- Express
- TypeScript
- Zod
- JWT
- bcrypt
- Multer

Install:
```bash
npm install express prisma @prisma/client jsonwebtoken bcrypt zod multer
npm install -D typescript tsx @types/node @types/express @types/jsonwebtoken @types/bcrypt @types/multer
```

## Database
PostgreSQL 16+ with pgvector.

Docker:
```bash
docker run --name knovexa-postgres -e POSTGRES_USER=knovexa -e POSTGRES_PASSWORD=knovexa_dev -e POSTGRES_DB=knovexa -p 5432:5432 -d pgvector/pgvector:pg16
```

Enable:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## AI
Local:
- Ollama
- Local chat model
- Local embedding model

Example:
```bash
ollama pull llama3.1:8b
```

Cloud:
- Configurable external LLM provider.
- Credentials only through environment variables.

## Testing
- Vitest
- Supertest
- Playwright

## Quality
- ESLint
- Prettier
- TypeScript strict mode

## Environment
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://knovexa:knovexa_dev@localhost:5432/knovexa
JWT_ACCESS_SECRET=replace-with-long-random-secret
JWT_REFRESH_SECRET=replace-with-long-random-secret
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=llama3.1:8b
OLLAMA_EMBEDDING_MODEL=<embedding-model>
STORAGE_PROVIDER=local
UPLOAD_DIR=./storage/uploads
MAX_FILE_SIZE_MB=20
```

Frontend:
```env
VITE_API_URL=http://localhost:4000/api/v1
```

Never commit .env. Commit .env.example.
