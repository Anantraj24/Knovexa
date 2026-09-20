import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('API Endpoints & Middleware', () => {
  it('GET /api/v1/health returns health status and requestId', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
    expect([200, 503]).toContain(res.status);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.application).toBe('Knovexa API');
  });

  it('Returns 404 with standardized error envelope for non-existent route', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.requestId).toBeDefined();
  });

  it('Rejects unauthenticated access to protected routes with 401', async () => {
    const res = await request(app).get('/api/v1/documents');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
