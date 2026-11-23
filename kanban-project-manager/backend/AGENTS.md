# Backend AGENTS.md

Describes the backend rules, structure, and best practices for the Kanban Project Manager.

## Overview

Node.js + Express backend (TypeScript strict mode), MongoDB with Mongoose. Serves the static Next.js frontend at `/` and exposes a REST API under `/api`. Everything is user-scoped via authentication.

## Stack

- Node.js, Express
- TypeScript (strict mode; no `any`)
- Mongoose (MongoDB ODM)
- dotenv, cors, helmet, bcryptjs, express-session, connect-mongo (or JWT httpOnly cookie)
- OpenRouter (`openai/gpt-oss-120b`) for AI features
- Vitest for backend unit tests

## Coding standards

- TypeScript strict mode everywhere; explicit types; no `any`.
- Proper TypeScript OOP (SOLID): classes for services/controllers/repositories; depend on abstractions, not concrete implementations.
- Single Responsibility: each module does one thing.
- Keep it simple — no over-engineering, no unnecessary defensive programming, no unused abstractions.
- Handle errors at the edge; never swallow errors silently.
- Never log secrets, API keys, or passwords.
- Conventional commits: feat:, fix:, docs:, chore:, test:, refactor:.

## Directory structure (backend/src)

```
src/
  config/          # env, db connection, middleware config
  controllers/     # request handlers (thin)
  services/        # business logic (OOP classes)
  repositories/    # data access (Mongoose models/queries)
  middleware/      # auth, error handling, validation
  routes/          # Express route definitions
  models/          # Mongoose schemas
  app.ts           # Express app setup
  server.ts        # entry point (listen)
```

## API conventions

- All mutating routes under `/api`.
- Auth middleware scopes every board/task route to the current user.
- Standard HTTP status codes: 200, 201, 204, 400, 401, 403, 404, 409, 500.
- Consistent JSON error shape: `{ error: string, message?: string }`.
- Database created automatically if it does not exist.

## Tests

- Backend unit tests with Vitest (mock Mongoose).
- Services and controllers > 90% coverage.
- Test both happy paths and error paths.

## Env

- `OPENROUTER_API_KEY`, `DB_URL`, `DB_NAME`, `PORT`, session secret.
- `.env` is gitignored and must never be committed.
