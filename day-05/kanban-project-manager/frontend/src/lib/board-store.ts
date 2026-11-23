import { create } from "zustand";
import { boardService } from "@/services/board.service";
import type { Project, BoardColumn, Card } from "@/services/board.service";

interface BoardState {
  project: Project | null;
  columns: BoardColumn[];
  isLoading: boolean;
  error: string | null;
  setProject: (project: Project) => void;
  loadBoard: (projectId: string) => Promise<void>;
  createProject: (name: string) => Promise<void>;
  renameColumn: (columnId: string, name: string) => Promise<void>;
  addCard: (columnId: string, title: string, details: string) => Promise<void>;
  updateCard: (cardId: string, columnId: string, title: string, details: string) => Promise<void>;
  deleteCard: (cardId: string, columnId: string) => Promise<void>;
  moveCard: (cardId: string, targetColumnId: string, targetIndex: number) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  project: null,
  columns: [],
  isLoading: false,
  error: null,

  setProject: (project) => set({ project }),

  loadBoard: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const [columns] = await Promise.all([
        boardService.listColumns(projectId),
      ]);
      set({ columns, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load board", isLoading: false });
    }
  },

  createProject: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const project = await boardService.createProject(name);
      set({ project, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create project", isLoading: false });
      throw error;
    }
  },

  renameColumn: async (columnId, name) => {
    const previous = get().columns;
    set({ columns: previous.map((c) => c.id === columnId ? { ...c, name } : c) });
    try {
      await boardService.updateColumn(get().project?.id || "", columnId, name);
    } catch (error) {
      set({ columns: previous, error: error instanceof Error ? error.message : "Failed to rename column" });
      throw error;
    }
  },

  addCard: async (columnId, title, details) => {
    const previous = get().columns;
    const newCard: Card = { id: crypto.randomUUID(), title, details, columnId, position: 0 };
    set({ columns: previous.map((c) => c.id === columnId ? { ...c, cards: [...c.cards, newCard] } : c) });
    try {
      await boardService.createCard(get().project?.id || "", columnId, title, details);
    } catch (error) {
      set({ columns: previous, error: error instanceof Error ? error.message : "Failed to add card" });
      throw error;
    }
  },

  updateCard: async (cardId, columnId, title, details) => {
    const previous = get().columns;
    set({ columns: previous.map((c) => c.id === columnId ? { ...c, cards: c.cards.map((card) => card.id === cardId ? { ...card, title, details } : card) } : c) });
    try {
      await boardService.updateCard(get().project?.id || "", columnId, cardId, title, details);
    } catch (error) {
      set({ columns: previous, error: error instanceof Error ? error.message : "Failed to update card" });
      throw error;
    }
  },

  deleteCard: async (cardId, columnId) => {
    const previous = get().columns;
    set({ columns: previous.map((c) => c.id === columnId ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) } : c) });
    try {
      await boardService.deleteCard(get().project?.id || "", columnId, cardId);
    } catch (error) {
      set({ columns: previous, error: error instanceof Error ? error.message : "Failed to delete card" });
      throw error;
    }
  },

  moveCard: async (cardId, targetColumnId, targetIndex) => {
    const previous = get().columns;
    const sourceColumn = previous.find((c) => c.cards.some((card) => card.id === cardId));
    if (!sourceColumn) return;

    const card = sourceColumn.cards.find((c) => c.id === cardId)!;
    const withoutSource = previous.map((c) => c.id === sourceColumn.id ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) } : c);
    const target = withoutSource.find((c) => c.id === targetColumnId);
    if (!target) return;

    const cards = [...target.cards];
    const index = Math.max(0, Math.min(targetIndex, cards.length));
    cards.splice(index, 0, card);

    set({ columns: withoutSource.map((c) => c.id === targetColumnId ? { ...c, cards } : c) });

    try {
      await boardService.moveCard(get().project?.id || "", cardId, { cardId, targetColumnId, targetIndex });
    } catch (error) {
      set({ columns: previous, error: error instanceof Error ? error.message : "Failed to move card" });
      throw error;
    }
  },
}));
