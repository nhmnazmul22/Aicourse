# Frontend AGENTS.md

Describes the existing frontend code and the rules/best practices agents must follow when working on it.

## Overview

Kanban board frontend (Next.js App Router). Pure-frontend demo initially, later wired to a backend API. Lives at `frontend/`; served statically at `/`.

## Stack

- Next.js 16.4.6 (App Router), React 19.3.0, react-dom 19.3.0
- `@dnd-kit/react` ^0.5.3 (drag-and-drop)
- Tailwind CSS 4.3.3 + `@tailwindcss/postcss` ^4.3.3
- **shadcn/ui** (UI component primitives)
- **zustand** (client state management)
- TypeScript strict mode; path alias `@/*` -> `./src/*`
- Vitest 4.0.5 (unit tests, `src/**/*.test.ts`)
- Playwright ^1.56.1 (e2e tests, `e2e/`)
- ESLint 9 with `eslint-config-next`

## Scripts

- `npm run dev` — next dev
- `npm run build` — next build --webpack
- `npm run start` — next start
- `npm run lint` — eslint
- `npm test` — vitest run
- `npm run test:e2e` — playwright test

## Source layout

- `src/app/layout.tsx` — root layout, metadata, imports `globals.css`
- `src/app/page.tsx` — home route; server component by default; only becomes `"use client"` when client interaction is needed; otherwise simply initializes client components
- `src/app/board.tsx` — `"use client"` Kanban board: columns, cards, drag-and-drop (@dnd-kit), rename column, add/edit/delete cards, edit dialog
- `src/app/globals.css` — Tailwind import + design tokens/color scheme:
  - Navy `#032147` (headings), Blue `#209dd7` (links/key), Purple `#753991` (submit/important), Yellow `#ecad0a` (accents), Gray `#888888` (supporting text)
- `src/lib/board.ts` — pure board logic: types (`Card`, `BoardColumn`, `Board`), `initialBoard` (5 fixed columns), `renameColumn`, `addCard`, `updateCard`, `deleteCard`, `moveCard`
- `src/lib/board.test.ts` — vitest unit tests for board logic

## Component-based structure rules

- Pages are thin: server components where possible, only init child components;
- All components must be server components only add `"use client"` only when client interaction (state, effects, event handlers) is required.
- Build small, focused, reusable components; each component does one thing.
- Co-locate component styles with the component (Tailwind classes).
- Use shadcn/ui primitives for base UI (buttons, dialogs, forms, etc.) styled with the project color scheme.
- Manage shared client state with zustand stores (e.g., board state, auth state).
- All API calls go through methods in `src/services/` (one service per domain, e.g., `auth.service.ts`, `board.service.ts`); components never call `fetch` directly.
- Keep components small and focused on one responsibility.

## Key conventions

- TypeScript strict; no `any`.
- `"use client"` only where client interaction is needed; pages default to server components.
- Column IDs: `backlog`, `todo`, `in-progress`, `review`, `done` (5 fixed columns, renamable).
- Cards have `id`, `title`, `details`; IDs generated with `crypto.randomUUID()`.
- Drag uses `@dnd-kit` `DragDropProvider` with `PointerSensor` + `KeyboardSensor`; cards are sortable, columns are droppable.
- Path alias `@/*` for src-relative imports.

## Best practices (frontend)

- Server components by default; opt into client components only when necessary.
- Never call `fetch` directly from components — use `src/services/`.
- Handle errors gracefully at the edge; show loading/error states.
- No `any`; keep types explicit.
- Accessible components: proper aria labels, roles, keyboard navigation.
- Follow the color scheme tokens in `globals.css`.
- No emojis in code, comments, or documentation.
- Conventional commits: feat:, fix:, docs:, chore:, test:, refactor:.

## Tests

- Unit: `src/lib/board.test.ts` (run via `npm test`)
- E2E: `e2e/board.spec.ts` — board opens with 5 columns, rename/add/edit/delete card, drag-and-drop move, cancel restores, mobile reachability (run via `npm run test:e2e`, starts dev server on `http://127.0.0.1:3000`)
