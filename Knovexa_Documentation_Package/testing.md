# Knovexa — Testing Strategy

## Pyramid
Most tests are unit tests, followed by integration tests, with a smaller set of critical E2E tests.

## Unit
Vitest. Test validators, chunking, normalization, auth helpers, permission checks, RAG context construction, citation mapping and AI adapters.

Example:
```ts
describe("chunkText", () => {
  it("creates deterministic chunks", () => {
    const result = chunkText("long text", { maxTokens: 500, overlap: 50 });
    expect(result.length).toBeGreaterThan(0);
  });
});
```

## Integration
Supertest against a dedicated test database. Cover registration, login, me, upload, listing, deletion and chat.

## RAG
Use deterministic fixtures. Example source: `Project deadline is September 30.` Question: `When is the project deadline?` Expected behavior: answer cites the relevant chunk.

## Hallucination
If context says only `The project uses PostgreSQL` and user asks which cloud provider hosts it, expected behavior is to state that the available documents do not provide enough information.

## Authorization
User A owns Document A. User B must receive 403/404 and never receive content.

## Upload tests
Valid PDF/DOCX/TXT, 20MB boundary, oversized file, unsupported extension, malformed PDF and malicious filename.

## E2E
Playwright:
Register → Login → Upload PDF → wait for READY → open chat → ask question → receive answer → click citation → verify source.

## Coverage targets
Unit >= 80%; backend >= 75%; critical E2E workflows 100%.

## Performance
Measure API latency, document processing time, embedding latency, retrieval latency and LLM latency. Establish production SLOs only after collecting baselines.

## Security
Test ownership, expired JWTs, upload limits, CORS, security headers, secret leakage, SQL injection protection and prompt-injection handling.

## CI
Install → lint → typecheck → unit → integration → build. Main additionally runs E2E and production build.
