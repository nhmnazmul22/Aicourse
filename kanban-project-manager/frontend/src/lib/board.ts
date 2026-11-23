export type Card = {
  id: string;
  title: string;
  details: string;
};

export type BoardColumn = {
  id: string;
  name: string;
  cards: Card[];
};

export type Board = BoardColumn[];

export const initialBoard: Board = [
  {
    id: "backlog",
    name: "Backlog",
    cards: [
      { id: "card-1", title: "Map the onboarding flow", details: "Review the first-run experience and note the moments where new teams need more guidance." },
      { id: "card-2", title: "Audit empty states", details: "List the places that need a helpful next step when there is no content yet." },
    ],
  },
  {
    id: "todo",
    name: "To do",
    cards: [
      { id: "card-3", title: "Prepare sprint kick-off", details: "Confirm the sprint goal and share the plan with the product team." },
      { id: "card-4", title: "Write release notes", details: "Collect the customer-facing changes planned for this release." },
    ],
  },
  {
    id: "in-progress",
    name: "In progress",
    cards: [
      { id: "card-5", title: "Build the activity timeline", details: "Show recent project updates in a clear, scannable feed." },
      { id: "card-6", title: "Refine board interactions", details: "Polish keyboard focus, drag feedback, and the add-card flow." },
      { id: "card-7", title: "Review API error states", details: "Make recovery steps clear when a request cannot be completed." },
    ],
  },
  {
    id: "review",
    name: "Review",
    cards: [
      { id: "card-8", title: "Update component library", details: "Check spacing and type styles against the latest design system." },
      { id: "card-9", title: "Test invite flow", details: "Verify the invitation experience on desktop and mobile." },
    ],
  },
  {
    id: "done",
    name: "Done",
    cards: [
      { id: "card-10", title: "Set up project workspace", details: "Create the shared space and add the core product team." },
    ],
  },
];

export function renameColumn(board: Board, columnId: string, name: string): Board {
  const trimmedName = name.trim();
  if (!trimmedName) return board;
  return board.map((column) => column.id === columnId ? { ...column, name: trimmedName } : column);
}

export function addCard(board: Board, columnId: string, card: Card): Board {
  return board.map((column) => column.id === columnId ? { ...column, cards: [...column.cards, card] } : column);
}

export function updateCard(board: Board, cardId: string, title: string, details: string): Board {
  return board.map((column) => ({
    ...column,
    cards: column.cards.map((card) => card.id === cardId ? { ...card, title, details } : card),
  }));
}

export function deleteCard(board: Board, cardId: string): Board {
  return board.map((column) => ({ ...column, cards: column.cards.filter((card) => card.id !== cardId) }));
}

export function moveCard(board: Board, cardId: string, targetColumnId: string, targetIndex: number): Board {
  const sourceColumn = board.find((column) => column.cards.some((card) => card.id === cardId));
  const targetColumn = board.find((column) => column.id === targetColumnId);
  if (!sourceColumn || !targetColumn) return board;

  const sourceIndex = sourceColumn.cards.findIndex((card) => card.id === cardId);
  const [card] = sourceColumn.cards.slice(sourceIndex, sourceIndex + 1);
  const withoutCard = board.map((column) => column.id === sourceColumn.id
    ? { ...column, cards: column.cards.filter((item) => item.id !== cardId) }
    : column);
  const destination = withoutCard.find((column) => column.id === targetColumnId);
  if (!destination) return board;

  const cards = [...destination.cards];
  const index = Math.max(0, Math.min(targetIndex, cards.length));
  cards.splice(index, 0, card);
  return withoutCard.map((column) => column.id === targetColumnId ? { ...column, cards } : column);
}

