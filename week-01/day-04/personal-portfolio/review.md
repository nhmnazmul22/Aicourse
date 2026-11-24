# Code Review: Personal Portfolio (Next.js + AI Digital Twin)

**Project:** `personal-portfolio`
**Location:** `/mnt/d/Web-developement/Aicourse/day-04/personal-portfolio`
**Review date:** 2026-11-15
**Scope:** All source files under `src/app/`, config files, `.env`, `package.json`
**Constraint:** No code changes were made; this is a findings-only report.

---

## 1. Executive Summary

This is a small, functional Next.js 15 / React 19 personal portfolio with an AI "Digital Twin" chat backed by OpenRouter. The site renders correctly, is responsive, and includes server-side API routing. The code is self-contained and easy to read, but there are **security, reliability, maintainability, and tooling gaps** that should be addressed before any public deployment — most urgently the exposed API key and lack of rate limiting on the chat endpoint.

---

## 2. Security Findings (Critical)

### 2.1 Real API key present in `.env` (Critical)

`src/../.env` contains a live OpenRouter secret key:

```
OPEN_ROUTER_KEY=
```

`.gitignore` excludes `.env`, which is correct, but the key itself is already written to disk in plaintext. If this file is ever committed, pushed to a public remote, or copied into a CI/CD environment, the key is compromised and OpenRouter credits could be abused.

**Remedial action:**

- Remove the real key from `.env` immediately; replace with a placeholder or regenerate the key on OpenRouter.
- Keep `.env` in `.gitignore` (already done) and never commit it.
- Inject `OPEN_ROUTER_KEY` via the hosting provider's server-side environment variables at deploy time (Vercel dashboard / platform env settings), not via a checked-in file.
- Consider rotating the exposed key since it has existed in plaintext.

### 2.2 No rate limiting on `/api/chat` (Critical)

`src/app/api/chat/route.ts` accepts unlimited POST requests with only message-count/length validation. There is no rate limiting, IP throttling, or usage cap. A malicious visitor could exhaust OpenRouter credits or incur unexpected costs.

**Remedial action:**

- Add rate limiting (e.g., `@upstash/ratelimit`, `express-rate-limit` if using a server adapter, or Next.js middleware + Redis/KV).
- At minimum, enforce a per-IP request window and a daily cap.

### 2.3 No request-size validation on the API route

`await request.json()` is called without checking `Content-Length` or request body size. An excessively large body could be parsed into memory before validation runs.

**Remedial action:**

- Check `request.headers.get('content-length')` and reject oversized bodies before parsing.

### 2.4 No Content Security Policy or security headers

`next.config.ts` is empty (`{}`). No CSP, `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy` headers are set. The page embeds external resources (Google Fonts, external `target="_blank"` links) without restriction.

**Remedial action:**

- Configure `headers()` in `next.config.ts` to emit a baseline CSP (allow self + `fonts.googleapis.com`, restrict frame-ancestors, etc.) and standard security headers.

### 2.5 Personal PII exposed in footer

The footer publishes a personal phone number (`tel:+8801940520508`) and email. This is intentional for a portfolio but constitutes PII exposure and may attract spam.

**Remedial action:**

- Consider a contact form instead of raw `mailto:`/`tel:` links, or at least accept this as a deliberate trade-off and document it.

### 2.6 `target="_blank"` link hygiene

Most external links use `rel="noreferrer"`, which is good. Verify all external anchors carry it to prevent `window.opener` exploitation. This is mostly compliant already; no new finding.

---

## 3. Code Quality & Maintainability

### 3.1 Import placed after usage in `page.tsx` (High)

`src/app/page.tsx:164`:

```tsx
export default function Home() { ... }
import ChatTwin from './ChatTwin'
```

The import appears at the bottom of the file, after the default export that uses `ChatTwin`. JavaScript hoisting makes this work, but it is confusing, non-idiomatic, and breaks the "imports at top" convention. It can also cause issues with some bundlers/linters and hurts readability.

**Remedial action:** Move `import ChatTwin from './ChatTwin'` to the top of `page.tsx` with other imports.

### 3.2 Untyped data arrays

`projects` (`page.tsx:1`) and `skillGroups` (`page.tsx:34`) are declared without TypeScript types. This forfeits type safety for the data that drives the UI — a typo in a property name would only surface at runtime.

**Remedial action:** Define explicit interfaces/types:

```ts
interface Project {
  index: string;
  name: string;
  category: string;
  description: string;
  stack: string[];
  mark: string;
  visual: string;
}
interface SkillGroup {
  label: string;
  skills: string[];
}
```

Also consider changing `skills` from a comma-separated string to a `string[]` so individual skills can be rendered as chips with proper keys and styling.

### 3.3 Fragile, index-based React keys

- `page.tsx:141`: `key={project.name}` — names could collide if duplicated.
- `ChatTwin.tsx:61`: `key={i}` over `messages` — index keys are an anti-pattern when items are appended; React may reuse DOM nodes incorrectly if messages are ever reordered or edited.
- `ChatTwin.tsx:23-24`: `key={i}` inside `FormattedReply` list/table mapping.

**Remedial action:** Use stable, unique IDs (e.g., `project.index`, a UUID/timestamp per message, or a counter) instead of array indices.

### 3.4 Hand-rolled Markdown formatter (`FormattedReply`)

`ChatTwin.tsx:7-38` parses Markdown with regex and string splits. It handles headings, bold/italic, links, bullets, and simple tables, but is not a complete Markdown implementation. Edge cases (nested lists, code blocks, blockquotes, links with `)` in URLs, mismatched delimiters) will render literally or break. It also splits inline content by regex and returns raw strings into JSX — React escapes text, so XSS risk is low, but a malformed link regex could pass unexpected attributes.

**Remedial action:** Replace with a maintained Markdown renderer (e.g., `remark-react` or `marked` with a DOM sanitizer such as `dompurify`) configured to strip unsafe HTML. Keep the allow-list approach (headings, lists, links, bold/italic, tables).

### 3.5 Monolithic `globals.css`

`src/app/globals.css` is a single 16-line file where each line is extremely long and minified-looking. It mixes layout, typography, component styles, and media queries without separation. Hard to maintain, review, or tree-shake.

**Remedial action:** Split into module-scoped CSS files (e.g., `globals.css` for variables/reset, `page.module.css`, `chat.module.css`) or adopt a utility approach (Tailwind) consistent with the listed skill stack.

### 3.6 No ESLint / Prettier configuration

There is no `.eslintrc`, `eslint.config.*`, or Prettier config. No automated linting or formatting is enforced. TypeScript `strict: true` is enabled, which is good, but there is no lint step in `package.json` scripts.

**Remedial action:** Add ESLint with Next.js config and Prettier; add `lint` and `format` scripts to `package.json`.

### 3.7 `skipLibCheck: true` in `tsconfig.json`

This can hide genuine type errors in `.d.ts` files. Acceptable for Next.js defaults but worth noting.

### 3.8 Hardcoded model and metadata

`route.ts:17` hardcodes `model: 'openai/gpt-oss-120b'` and the `HTTP-Referer`/`X-Title` headers point to `https://nhmnazmul.vercel.app`. These should be environment-variable driven for portability across environments.

**Remedial action:** Move model, referer, and title to `.env` variables (`OPENROUTER_MODEL`, `NEXT_PUBLIC_SITE_URL`, etc.).

---

## 4. Reliability & Error Handling

### 4.1 Swallowed errors in chat `catch`

`ChatTwin.tsx:57`: `catch (e) { setError(...) }` discards the original error (`e`) entirely — it is not logged. On the server, `route.ts:22-23` likewise returns a generic 500 without logging the underlying failure. Debugging production issues is difficult.

**Remedial action:** Log errors server-side (console or structured logging) and client-side, while still returning generic messages to the client.

### 4.2 No retry mechanism

A transient OpenRouter failure results in a static error message with no retry button. The user must retype and resubmit manually.

**Remedial action:** Add a "Retry" action next to the error state that re-sends the last message.

### 4.3 No loading skeleton / optimistic UI

The chat shows "Thinking…" only while busy. No optimistic message, no typing indicator, no scroll-to-bottom behavior for new messages.

**Remedial action:** Auto-scroll the message container on new messages; consider an optimistic user message bubble.

### 4.4 `input.trim()` validation only on client

The client checks `if (!content || busy) return`, but the server re-validates. Duplicate validation is fine, but the client has no debounce — rapid submissions send multiple requests back-to-back (mitigated by `busy` flag, but only one in-flight at a time).

### 4.5 No conversation persistence

Messages live only in React state; a page refresh clears the conversation. No localStorage or server-side history.

**Remedial action:** Optional — persist to `localStorage` for session continuity (note privacy implications).

---

## 5. Accessibility & UX

### 5.1 Send button uses `↑` as visible text

`ChatTwin.tsx:61` renders `↑` as the button label with `aria-label="Send message"`. Screen readers generally use the aria-label, but the symbol alone is not a clear affordance for all users.

**Remedial action:** Use visible text ("Send") or an icon with accessible label, and keep `aria-label`.

### 5.2 No `autocomplete` on chat input

The input lacks `autocomplete="off"` or similar, so browsers may autofill unrelated values into the chat field.

### 5.3 Reduced-motion support exists

`globals.css:13` includes `@media(prefers-reduced-motion:reduce)` — positive finding.

### 5.4 Skip link / landmark navigation

No skip-to-content link; the page relies on semantic sectioning (`<main>`, `<section>`, `<footer>`) which is reasonably good. `<html lang="en">` is set.

---

## 6. Performance & Build

### 6.1 No image optimization config

`next.config.ts` is empty. No `images.remotePatterns` configured, though no `<Image>` components are currently used. If images are added later, they will fall back to `next/image` defaults.

### 6.2 Large inline CSS

All CSS is in one global stylesheet shipped on every page. For a single-page portfolio this is acceptable, but it will grow.

### 6.3 No `output: 'standalone'` config

For container/Docker deployment, Next.js standalone output is not configured.

**Remedial action:** Add `output: 'standalone'` to `next.config.ts` if deploying via Docker.

---

## 7. Testing & Tooling

### 7.1 Zero tests

There are no test files, no test script in `package.json`, and no test framework (Jest, Vitest, Playwright, etc.) configured. The complex `FormattedReply` regex parser and API validation logic are untested.

**Remedial action:** Add Vitest/Jest + React Testing Library; write unit tests for `FormattedReply` and API route validation.

### 7.2 No CI/CD configuration

No GitHub Actions or equivalent. Lint/type/build are not automated on push.

---

## 8. Deployment & Operations

### 8.1 `.env` not deployed automatically

`tutorial.md:250` correctly notes that the local `.env` is not uploaded. The deployer must manually add `OPEN_ROUTER_KEY` to the hosting provider. This is a common deployment failure point.

### 8.2 No `robots.txt` / `sitemap.xml`

Not configured; search indexing behavior defaults to Next.js behavior.

### 8.3 Build command available

`npm run build` (`next build`) and `npm start` exist; `npm dev` binds to `0.0.0.0` (suitable for containers/dev, less ideal for production where `0.0.0.0` exposes the dev server).

---

## 9. Consolidated Remedial Actions (Priority Ordered)

| Priority | Action                                                                               | Location                    | Effort |
| -------- | ------------------------------------------------------------------------------------ | --------------------------- | ------ |
| Critical | Rotate/remove the real OpenRouter key from `.env`; inject via platform env at deploy | `.env`, hosting dashboard   | Low    |
| Critical | Add rate limiting to `POST /api/chat`                                                | `src/app/api/chat/route.ts` | Medium |
| High     | Move `import ChatTwin` to top of `page.tsx`                                          | `src/app/page.tsx:164`      | Low    |
| High     | Add TypeScript interfaces for `projects` and `skillGroups`                           | `src/app/page.tsx`          | Low    |
| High     | Replace index-based React keys with stable IDs                                       | `page.tsx`, `ChatTwin.tsx`  | Low    |
| High     | Add ESLint + Prettier and `lint`/`format` scripts                                    | repo root, `package.json`   | Low    |
| Medium   | Add request-size validation and logging to API route                                 | `route.ts`                  | Low    |
| Medium   | Replace hand-rolled Markdown formatter with a maintained library                     | `ChatTwin.tsx`              | Medium |
| Medium   | Add retry button and error logging to chat                                           | `ChatTwin.tsx`, `route.ts`  | Low    |
| Medium   | Configure security headers / CSP in `next.config.ts`                                 | `next.config.ts`            | Low    |
| Medium   | Make model and referer headers env-configurable                                      | `route.ts`                  | Low    |
| Low      | Add tests for formatter and API validation                                           | new test files              | Medium |
| Low      | Add `output: 'standalone'` to `next.config.ts`                                       | `next.config.ts`            | Low    |

---

## 10. Positive Observations

- `.env` is correctly listed in `.gitignore`.
- TypeScript `strict: true` is enabled.
- Server-side API key never reaches the browser.
- `'use client'` boundary is correctly used only where needed (`ChatTwin.tsx`).
- `aria-label`, `rel="noreferrer"`, and `prefers-reduced-motion` are present.
- `tutorial.md` already contains a self-review with five improvement suggestions that align with this report (items 1, 2, 3, 4, 5 in its section 11).

---

**End of review.** No files were modified. The next step is to prioritize the Critical security items (key rotation + rate limiting) before any public deployment.
