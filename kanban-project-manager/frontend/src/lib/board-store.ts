import { create } from "zustand";
import { boardService } from "@/services/board.service";
import type { Project, BoardColumn, Card } from "@/services/board.service";

interface BoardState {
  project: Project | null;
  projects: Project[];
  columns: BoardColumn[];
  isLoading: boolean;
  error: string | null;
  setProject: (project: Project) => void;
  loadProjects: () => Promise<void>;
  loadBoard: (projectId: string) => Promise<void>;
  createProject: (name: string) => Promise<void>;
  updateProject: (name: string) => Promise<void>;
  deleteProject: () => Promise<void>;
  renameColumn: (columnId: string, name: string) => Promise<void>;
  addCard: (columnId: string, title: string, details: string) => Promise<void>;
  updateCard: (cardId: string, columnId: string, title: string, details: string) => Promise<void>;
  deleteCard: (cardId: string, columnId: string) => Promise<void>;
  moveCard: (cardId: string, targetColumnId: string, targetIndex: number) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  project: null,
  projects: [],
  columns: [],
  isLoading: false,
  error: null,

  setProject: (project) => set({ project }),

  loadProjects: async () => {
    try {
      const projects = await boardService.listProjects();
      set({ projects });
    } catch {
      // handled gracefully
    }
  },

  loadBoard: async (projectId) => {
    if (!projectId) return;
    set({ isLoading: true, error: null });
    try {
      const data = await boardService.getBoard(projectId);
      set({
        project: data.project,
        columns: data.columns || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load board",
        isLoading: false,
      });
    }
  },

  createProject: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const project = await boardService.createProject(name);
      set({ project, isLoading: false });
      if (project?.id) {
        await get().loadBoard(project.id);
      }
      await get().loadProjects();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create project",
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (name) => {
    const current = get().project;
    if (!current) return;
    try {
      const updated = await boardService.updateProject(current.id, name);
      set({ project: updated });
      await get().loadProjects();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update project",
      });
      throw error;
    }
  },

  deleteProject: async () => {
    const current = get().project;
    if (!current) return;
    try {
      await boardService.deleteProject(current.id);
      const remaining = await boardService.listProjects();
      set({ projects: remaining });
      if (remaining.length > 0) {
        set({ project: remaining[0] });
        await get().loadBoard(remaining[0].id);
      } else {
        const newProj = await boardService.createProject("My Project");
        set({ project: newProj });
        await get().loadBoard(newProj.id);
        await get().loadProjects();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete project",
      });
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
    const tempId = crypto.randomUUID();
    const newCard: Card = { id: tempId, title, details, columnId, position: 0 };
    set({ columns: previous.map((c) => c.id === columnId ? { ...c, cards: [...c.cards, newCard] } : c) });
    try {
      const createdCard = await boardService.createCard(get().project?.id || "", columnId, title, details);
      if (createdCard && createdCard.id) {
        set({
          columns: get().columns.map((c) =>
            c.id === columnId
              ? {
                  ...c,
                  cards: c.cards.map((card) =>
                    card.id === tempId ? createdCard : card
                  ),
                }
              : c
          ),
        });
      }
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
