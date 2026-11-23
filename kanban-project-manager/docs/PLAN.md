# High level steps for project

## Part 1: Plan

**Success criteria**

- `docs/PLAN.md` contains detailed substeps, checklists, tests, and success criteria for every part.
- `frontend/AGENTS.md` describes the existing frontend code accurately.
- User has reviewed and approved this plan.

**Checklist**

- [ ] Enrich this document with per-part substeps, checklists, tests, and success criteria
- [ ] Create `frontend/AGENTS.md` describing the existing frontend
- [ ] User reviews and approves the plan

---

## Part 2: Scaffolding

**Goal**: Docker infra + Express backend serving static HTML "hello world" at `/` plus one API endpoint.

**Substeps**

1. Create `Dockerfile` (multi-stage: build deps + run), `.dockerignore`.
2. Create `docker-compose.yml` wiring backend + mongodb.
3. Create `backend/src` Express app (TypeScript strict), entry `server.ts`.
4. Configure `tsconfig.json`, `package.json` (express, mongoose, dotenv, cors, helmet, @types/\*).
5. Add health `GET /` returning example static HTML ("hello world") and `GET /api/hello` JSON.
6. Write `scripts/start-server.sh` (Linux/Mac) and `scripts/stop-server.sh` (Linux/Mac/PC) per platform.
7. Add `.env` template values (OPENROUTER_API_KEY, DB_URL, DB_NAME, PORT).
8. Verify `docker compose up` serves `hello world` at `/` and `/api/hello` returns JSON.

**Tests**

- Backend: `GET /` returns 200 with HTML containing "hello world"; `GET /api/hello` returns 200 JSON `{ message: "hello world" }`.
- Docker: `docker compose up` starts, both ports respond; `docker compose down` stops cleanly.

**Success criteria**

- `http://localhost:<PORT>/` returns example static HTML.
- `http://localhost:<PORT>/api/hello` returns JSON.
- Start/stop scripts work on Linux, Mac, and PC.

---

## Part 3: Add in Frontend

**Goal**: Build frontend statically and serve it at `/`; demo Kanban board displayed; comprehensive unit + integration tests.

**Substeps**

1. Create `frontend/AGENTS.md` describing existing frontend code.
2. **Frontend audit (do before any backend wiring):**
   - a. Check frontend fulfills all MVP business requirements (signin/signup gate, kanban board, 5 fixed renamable columns, CRUD tasks, drag-and-drop move, AI chat sidebar).
   - b. Check all UI/UX rules are followed (color scheme, responsive design, accessibility, loading/error states, keyboard navigation).
   - c. Identify missing pages or components (e.g., login page, signup page, AI chat sidebar, auth layout, project list).
   - d. Identify any feature needed but missing in UI (auth forms, AI chat sidebar, logout, project switching).
   - e. Check frontend code follows all best practices (server components by default, `"use client"` only when needed, shadcn/ui, zustand, `src/services/` for API calls, no `fetch` in components, TypeScript strict, no `any`).
   - f. Fix anything found wrong before proceeding to backend wiring.
3. Verify existing frontend builds (`npm run build`) and lint passes (`npm run lint`).
4. Add missing pages/components/features identified in the audit.
5. Add Express static-serving middleware in backend to serve built frontend at `/`.
6. Update build pipeline so backend serves `frontend/out` (or Next build output) at root.
7. Run unit tests (`vitest run`) and e2e tests (`playwright test`) against served frontend.
8. Fix any build/lint/test failures.

**Tests**

- Unit: all `board.test.ts` cases pass (rename/add/update/delete/move).
- E2E: board opens with 5 columns; rename/add/edit/delete card; drag-and-drop move; cancel restores; mobile reachability.
- Build: `npm run build` succeeds; `npm run lint` clean.
- Served: backend `/` renders the Kanban board.
- Audit: frontend requirements/UI-UX/best-practices checklist documented and all gaps fixed.

**Success criteria**

- Frontend builds and lints clean.
- All unit + e2e tests pass.
- Demo Kanban board visible at `/` when served by backend.
- Frontend audit complete: all requirements, UI/UX rules, missing pages/components/features, and best-practices gaps identified and fixed.

---

## Part 4: Add user sign in experience

**Goal**: Login required at `/`; signup with email, name, companyname (optional), password, avatar (optional); credentials validated against MongoDB; logout supported.

**Substeps**

1. Define `User` schema/model (email, name, companyname optional, password hash, avatarUrl optional, createdAt).
2. Add auth API routes: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
3. Hash passwords with bcrypt; store credentials in MongoDB (not hardcoded).
4. Session/cookie-based auth (express-session + connect-mongo or JWT httpOnly cookie).
5. Frontend: signup page (email, name, companyname optional, password, avatar optional) and login page at `/` (credentials form); redirect to board after login/signup; logout button; protect board route.
6. Frontend: API client with auth token/cookie handling; 401 redirects to login.
7. Tests: signup/login/logout flows, invalid credentials rejected, duplicate email rejected, protected board redirects to login.

**Tests**

- Backend: signup creates user with email/name/companyname/avatar; login with correct creds returns 200 + session/cookie; wrong creds return 401; duplicate email returns 409; `/api/me` returns user when authenticated, 401 when not; logout clears session.
- Frontend: `/` shows login form when signed out; signup → login → board; logout returns to login; board inaccessible without auth (redirect).
- E2E: signup → login → view board → logout → redirected to login.

**Success criteria**

- Unauthenticated `/` shows login screen.
- Valid signup/login credentials log user in and show Kanban board.
- Logout returns to login; board no longer accessible.
- Credentials stored in MongoDB (passwords hashed, never plaintext).
- Signup accepts email, name, optional companyname, password, optional avatar.

---

## Part 5: Database modeling

**Goal**: Propose and document Kanban schemas; create DB if not exists.

**Substeps**

1. Design schemas: `User`, `Project`, `BoardColumn`, `Card` (with user scoping).
2. Document schema relationships and indexes in `docs/database.md`.
3. Mongoose models with validation, timestamps, user-scoped queries.
4. Backend bootstrap ensures DB/collections created on startup.
5. Seed helper for dev (optional).

**Tests**

- Unit: model validation (required fields, column count limits, card fields).
- Integration: create project/board/columns/cards; query by user; cascade delete.

**Success criteria**

- `docs/database.md` documents all schemas and relationships.
- Mongoose models enforce validation.
- Database created automatically if missing.

---

## Part 6: Backend

**Goal**: Full CRUD API for Kanban features per user; thorough backend unit tests.

**Substeps**

1. Implement controllers/services (OOP): `ProjectService`, `BoardService`, `CardService`, `ColumnService`.
2. API routes:
   - Projects: `GET/POST/PUT/DELETE /api/projects`
   - Columns: `GET/POST/PUT/DELETE /api/projects/:id/columns`
   - Cards: `GET/POST/PUT/DELETE /api/projects/:id/columns/:columnId/cards`
   - Move card: `PATCH /api/projects/:id/cards/:cardId/move`
3. Auth middleware scopes all routes to current user.
4. Error handling middleware; 404/400/401/403/500 responses.
5. DB auto-create on connect.
6. Backend unit tests for services + controllers (mock mongoose).

**Tests**

- Unit: service layer create/read/update/delete/move/rename; auth scoping (user A cannot see user B's data); validation errors.
- Route: status codes and JSON bodies for happy + error paths.
- Coverage target: services and controllers > 90%.

**Success criteria**

- All Kanban CRUD + move operations work via API per user.
- Data is user-scoped; cross-user access denied.
- Backend unit tests pass with high coverage.

---

## Part 7: Frontend + Backend

**Goal**: Frontend consumes backend API; persistent Kanban board; thorough testing.

**Substeps**

1. Frontend API client (`@/*lib/api`) with base URL, auth headers/cookies, error handling.
2. Replace local `useState` board with API-backed state (fetch on load, optimistic updates + rollback on error).
3. Wire BoardView actions (add/edit/delete/move/rename) to API calls.
4. Loading/error states; retry on transient failure.
5. Integration tests (vitest + MSW or against test backend) and e2e (Playwright against running backend+DB).
6. Fix mismatches between frontend expectations and API shapes.

**Tests**

- Unit: API client request/response handling, error parsing.
- Integration: full board lifecycle via API (create project, add column/card, move, rename, delete).
- E2E: login → view persistent board → add/move/edit/delete → reload → data persists → logout.
- Cross-user: data isolation verified in e2e.

**Success criteria**

- Board loads from backend and persists changes.
- Reload preserves board state.
- All integration + e2e tests pass.

---

## Part 8: AI connectivity

**Goal**: Backend calls OpenRouter; simple "2+2" connectivity test.

**Substeps**

1. Add `OPENROUTER_API_KEY` to backend env; OpenRouter client (fetch to `https://openrouter.ai/api/v1/chat/completions`).
2. Model `openai/gpt-oss-120b` per AGENTS.md.
3. Route `POST /api/ai/test` sending "2+2" and asserting response contains "4".
4. Backend unit test mocking the HTTP client; integration test hitting OpenRouter (guarded by env flag).

**Tests**

- Unit: client builds correct request body/headers; parses response.
- Integration: `/api/ai/test` returns 200 and response includes "4".

**Success criteria**

- OpenRouter call succeeds and returns a completion.
- "2+2" test response contains "4".

---

## Part 9: Structured AI call with board JSON

**Goal**: Backend sends board JSON + user question + history; AI returns structured output (response + optional Kanban update).

**Substeps**

1. Define structured output schema (Zod): `{ response: string, updates?: { type: 'add'|'edit'|'delete'|'move', ... }[] }`.
2. Route `POST /api/ai/board`: builds system prompt with board JSON + conversation history; calls OpenRouter with `response_format`/structured outputs; validates with Zod.
3. Apply validated updates to board via board services (user-scoped).
4. Return `{ response, appliedUpdates }`.
5. Tests: structured output parsing, invalid AI output rejected, updates applied correctly, history included.

**Tests**

- Unit: prompt construction, Zod schema validation, update application (add/edit/delete/move).
- Route: valid structured output → 200 + applied updates; malformed AI output → 400/502 with safe error.
- Integration: end-to-end AI call modifies board in DB.

**Success criteria**

- AI call returns structured response + optional board updates.
- Invalid AI output never mutates the board (safe rejection).
- Board updates persisted to MongoDB.

---

## Part 10: AI chat sidebar widget

**Goal**: Sidebar AI chat; LLM updates Kanban via structured outputs; UI auto-refreshes.

**Substeps**

1. Frontend: sidebar chat component (messages, input, send).
2. Frontend: stream or poll AI response; render AI text; detect applied updates.
3. Frontend: when AI applies Kanban updates, refresh board reactively (re-fetch or optimistic apply).
4. Sidebar toggle; responsive layout; accessible (aria-live for updates).
5. E2E: send message → AI responds → board updates → UI reflects change without reload.
6. Polish: styling per color scheme (accent yellow, blue primary, purple secondary, navy headings, gray text).

**Tests**

- E2E: chat open/close; send message; AI response visible; board card added/moved by AI; board reflects change immediately.
- Unit: chat message handling, update application to local board state.

**Success criteria**

- AI chat sidebar functional.
- AI-initiated Kanban changes appear in UI immediately.
- All e2e tests pass; MVP complete and tested.
