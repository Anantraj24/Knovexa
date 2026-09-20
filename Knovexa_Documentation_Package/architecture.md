# Knovexa — System Architecture

## High-level
```text
React Frontend
      │ HTTPS
      ▼
Express API
 ┌────┼──────────────┐
 ▼    ▼              ▼
DB   Storage       RAG Engine
 │                    │
pgvector         Ollama / Cloud AI
```

## Upload
User → React → POST /documents → validation → storage → DB record → worker.

## Processing
Raw document → parser → normalized text → chunks → embeddings → PostgreSQL/pgvector → READY.

## RAG
Question → validation → query embedding → vector search → ownership filtering → context → LLM → grounded answer → citation mapping → frontend.

## Search
MVP uses vector search. Later combine PostgreSQL full-text search with vector search and ranking.

## Security boundary
Internet → frontend → API → authentication → authorization → user-owned resources.

## Deployment
```text
Internet
 ├── Vercel React
 └── Railway/Render API
       ├── Neon/Supabase PostgreSQL + pgvector
       ├── Object storage
       └── Ollama or cloud AI
```

## Local development
React localhost:5173 → Express localhost:4000 → PostgreSQL localhost:5432 → Ollama localhost:11434.

## Scalability path
Start with one API and one worker. Later introduce queue, multiple API instances, multiple workers and object storage. Do not introduce distributed infrastructure prematurely.
