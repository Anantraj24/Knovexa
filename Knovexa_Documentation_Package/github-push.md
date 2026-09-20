# Knovexa — Git Workflow

## Branches
main = production.
develop = integration.
Feature branches:
feature/authentication
feature/document-upload
feature/rag-engine
feature/chat-ui
feature/search

Fix branches:
fix/upload-validation
fix/citation-rendering

## Workflow
```bash
git checkout develop
git pull origin develop
git checkout -b feature/document-upload
git status
git add .
git commit -m "feat: implement document upload"
git push -u origin feature/document-upload
```

## Conventional commits
Format:
`type(scope): description`

Examples:
```text
feat(auth): implement JWT authentication
feat(documents): add PDF upload
feat(rag): implement vector retrieval
fix(api): handle missing document
test(rag): add retrieval integration tests
docs(api): document conversation endpoints
refactor(ai): introduce provider abstraction
chore(deps): update dependencies
```

## Before push
```bash
npm run lint
npm run test
npm run build
git diff --check
```

## Never commit
.env, credentials, API keys, private files, node_modules, dist, uploads.

## Releases
Use semantic versions:
v0.1.0, v0.2.0, v1.0.0.
