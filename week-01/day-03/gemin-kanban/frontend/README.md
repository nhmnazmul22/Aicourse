# Kanban Board MVP

A single-board Kanban project management web application built with Next.js, Tailwind CSS, and @hello-pangea/dnd.

## Features

- Single board view with 5 fixed columns.
- Inline column renaming.
- Cards with title and details.
- Drag and drop cards between columns or reorder within columns.
- Add card dialog per column.
- Delete card action.
- Pre-populated dummy data.
- Strict design color scheme: Accent Yellow (#ecad0a), Blue Primary (#209dd7), Purple Secondary (#753991), Dark Navy (#032147), and Gray Text (#888888).

## Development

Run development server:
```bash
npm run dev
```

Run unit tests:
```bash
npm run test
```

Run end-to-end tests:
```bash
npx playwright test
```

Build for production:
```bash
npm run build
npm run start
```
