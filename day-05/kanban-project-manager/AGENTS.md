# The Project Management MVP web app

## Project Overview

Build an MVP of a web-based Project Management application using a Kanban-style board.

The application will allow users to manage their projects, organize tasks, track progress, and visualize their work through a Kanban board.

The application should be simple, intuitive, responsive, and easy to use.

## Business Requirements

- User can signin and signup.
- When signed in, the user sees a kanban board representing their projects.
- An MVP of a Kanban style Project Management application as a web app
- Users can create, view, update, and delete their projects.
- Each project has its own Kanban board.
- The board has fixed 5 columns that can be renamed
- Users can create, view, update, and delete tasks within a project
- Users can move tasks between Kanban columns using drag and drop.
- There is an AI chat feature in a sidebar; The AI is able to create / edit / Move one or more cards.

## Limitations

For the MVP, this will run locally (in a docker container)

## Technical Details

- Implemented as a modern NextJS app, client rendered
- NodeJs, Express backend, Including serving the static NextJS site at /
- Everything packaged into a Docker container
- Use OpenRouter for the AI calls. An OPENROUTER_API_KEY is in .env in the project root
- Use `openai/gpt-oss-120b` as the model
- Use Mongodb database with mongoose for the database. DB_URL is the database url and DB_NAME is the database name.
- Start and Stop server scripts for Mac, PC, Linux in scripts/
- Testing: Vitest for unit tests, Playwright for e2e tests, ESLint for lint
- TypeScript strict mode

## Color Scheme

- Accent Yellow: `#ecad0a` - accent lines, highlights
- Blue Primary: `#209dd7` - links, key sections
- Purple Secondary: `#753991` - submit buttons, important actions
- Dark Navy: `#032147` - main headings
- Gray Text: `#888888` - supporting text, labels

## Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
2. Execute the plan ensuring all criteria are met
3. Carry out extensive integration testing with Playwright or similar, fixing defects
4. Only complete when the MVP is finished and tested, with the server running and ready for the user
5. Build and validate the database schema before writing API routes
6. Implement authentication early so all boards/tasks are user-scoped
7. Keep code simple; avoid over-engineering and unused abstractions
8. Don't need commit without review. After Developer confirmation you need commit anythings.
9. Backend must be use proper Typescript OOP. Don't need to implement OOP in frontend. OOP only for backend.

## Coding standards

- Use latest versions of libraries and idiomatic approaches as of today
- Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
- Be concise. Keep README minimal. IMPORTANT: no emojis ever
- TypeScript strict mode everywhere; no `any` types
- Use path alias "@/\*" for src-relative imports
- Handle errors gracefully;
- Never log secrets, API keys, or passwords
- Keep components small and focused on one responsibility
- Avoid unnecessary abstractions, patterns, or libraries
- Write unit tests for pure logic; co-locate tests with source
- No emojis in code, comments, or documentation
- Keep README minimal and concise
- Follow conventional commits: feat:, fix:, docs:, chore:, test:, refactor:
- Keep types explicit; avoid `any`
- Handle errors at the edge; do not swallow errors silently
- Keep configs minimal; avoid unused abstractions
- Follow SOLID principles
  - Single Responsibility: each component, function, or module does one thing
  - Open/Closed: extend behavior without modifying existing code where practical
  - Liskov Substitution: components should be replaceable without breaking the app
  - Interface Segregation: keep props and APIs small and focused
  - Dependency Inversion: depend on abstractions, not concrete implementations
