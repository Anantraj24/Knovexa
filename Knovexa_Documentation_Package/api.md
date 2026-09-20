# Knovexa — REST API Specification

Base: `/api/v1`

## Response format
Success:
```json
{"data": {}, "meta": {}}
```

Error:
```json
{"error":{"code":"VALIDATION_ERROR","message":"Invalid request.","requestId":"req_123"}}
```

## Auth
### POST /auth/register
Public. Body:
```json
{"name":"Anant","email":"anant@example.com","password":"StrongPassword123!"}
```
Returns 201.

### POST /auth/login
Public. Returns user and access token. 200/401.

### POST /auth/logout
Protected. Returns 204 or success object.

### GET /me
Protected. Returns current user.

## Documents
### GET /documents
Protected. Supports `page`, `pageSize`, `status`, `search`.

### POST /documents
Protected multipart/form-data field `file`. Returns document ID and status UPLOADED. Statuses: 201, 400, 413, 415.

### GET /documents/:id
Protected. Returns document metadata.

### DELETE /documents/:id
Protected. Returns 204; 403/404 for invalid access.

### POST /documents/:id/reprocess
Protected. Returns PROCESSING.

## Collections
### GET /collections
Protected.

### POST /collections
Body:
```json
{"name":"Research Papers"}
```
Returns 201.

### POST /collections/:id/documents/:documentId
Protected. Adds document. 204.

### DELETE /collections/:id/documents/:documentId
Protected. Removes membership. 204.

## Search
### POST /search
Body:
```json
{"query":"What are the deployment requirements?","documentIds":[],"limit":10}
```
Returns ranked results with document ID, name, chunk ID, page number, score and excerpt.

## Conversations
### GET /conversations
Protected.

### POST /conversations
Body:
```json
{"title":"Deployment Questions","documentId":"doc_123"}
```

### GET /conversations/:id
Returns conversation and messages.

### DELETE /conversations/:id
Returns 204.

### POST /conversations/:id/messages
Body:
```json
{"question":"What are the deployment requirements?"}
```
Response contains assistant message and citations.

## Health
### GET /health
Public. Returns application/database/version status.

## Status codes
200 success; 201 created; 204 no content; 400 bad request; 401 unauthenticated; 403 forbidden; 404 not found; 409 conflict; 413 too large; 415 unsupported media; 422 validation; 429 rate limit; 500 server error; 503 dependency unavailable.

## Security
Every protected endpoint verifies JWT, user identity, ownership and validated input. Never trust client-provided user IDs.
