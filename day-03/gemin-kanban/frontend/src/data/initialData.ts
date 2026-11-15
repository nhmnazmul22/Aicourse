import { BoardData } from "@/types/kanban";

export const initialBoardData: BoardData = {
  cards: {
    "card-1": {
      id: "card-1",
      title: "Market research analysis",
      details: "Evaluate competitor features, target personas, and pricing models for quarterly planning.",
    },
    "card-2": {
      id: "card-2",
      title: "API gateway authentication",
      details: "Implement JWT validation and token rotation for backend service routes.",
    },
    "card-3": {
      id: "card-3",
      title: "Database schema migration",
      details: "Prepare PostgreSQL scripts for team workspaces and membership relations.",
    },
    "card-4": {
      id: "card-4",
      title: "Responsive navigation header",
      details: "Build accessible navigation bar with mobile drawer and quick action links.",
    },
    "card-5": {
      id: "card-5",
      title: "Webhook delivery pipeline",
      details: "Set up asynchronous webhook dispatcher with exponential backoff retries.",
    },
    "card-6": {
      id: "card-6",
      title: "Component design review",
      details: "Verify color contrast, focus indicators, and spacing consistency with the design system.",
    },
    "card-7": {
      id: "card-7",
      title: "Next.js project setup",
      details: "Initialize frontend workspace, Tailwind tokens, and test runners.",
    },
  },
  columns: {
    "col-1": {
      id: "col-1",
      title: "Backlog",
      cardIds: ["card-1"],
    },
    "col-2": {
      id: "col-2",
      title: "To Do",
      cardIds: ["card-2", "card-3"],
    },
    "col-3": {
      id: "col-3",
      title: "In Progress",
      cardIds: ["card-4"],
    },
    "col-4": {
      id: "col-4",
      title: "Review",
      cardIds: ["card-5", "card-6"],
    },
    "col-5": {
      id: "col-5",
      title: "Done",
      cardIds: ["card-7"],
    },
  },
  columnOrder: ["col-1", "col-2", "col-3", "col-4", "col-5"],
};
