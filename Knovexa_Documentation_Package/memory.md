# Knovexa — Persistent Agent Memory

## Identity
Name: Knovexa
Tagline: Turn Documents Into Knowledge.
Category: AI Document Intelligence & RAG Platform.

## Product definition
Knovexa is not merely a PDF chatbot. It is a document knowledge workspace combining full-stack engineering, document processing, semantic retrieval, RAG, citations, search and production deployment.

## AI provider architecture
The RAG system must use a provider abstraction:
- OllamaProvider for local AI.
- CloudProvider for cloud AI.

Internal interface:
```ts
interface AIProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput>;
}
```

Never spread provider-specific logic through controllers.

## Stack decisions
- React + Vite + TypeScript.
- Tailwind CSS.
- Node.js + Express + TypeScript.
- PostgreSQL + Prisma.
- pgvector.
- JWT.
- Zod.
- Vitest, Supertest, Playwright.
- Docker.
- Ollama for local mode.

## UX decisions
Professional productivity SaaS. Take inspiration from Linear, Notion and Vercel without copying them. Avoid purple gradients, generic AI dashboards, excessive glassmorphism, neon effects and decorative clutter.

## Conventions
Components: PascalCase.
Functions: camelCase.
API: /api/v1.
Database models: PascalCase.
Database fields: camelCase.

## Security
Never commit secrets. Validate every input. Enforce resource ownership. Sanitize filenames. Limit uploads. Do not log credentials, tokens or private document contents unnecessarily.

## Agent rules
Before coding, read plan.md and the relevant architecture/implementation document. Implement one coherent unit at a time, run tests, update checklist.md, and update this file after architecture/state changes. Never silently change an architectural decision.
