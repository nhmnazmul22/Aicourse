import { api } from "./api";

export type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _id?: string;
};

export type Card = {
  id: string;
  title: string;
  details: string;
  columnId: string;
  position: number;
  _id?: string;
};

export type BoardColumn = {
  id: string;
  name: string;
  cards: Card[];
  _id?: string;
};

export type MoveCardInput = {
  cardId: string;
  targetColumnId: string;
  targetIndex: number;
};

export function normalizeCard(raw: unknown): Card {
  if (!raw || typeof raw !== "object") return raw as Card;
  const c = raw as Record<string, unknown>;
  const id =
    typeof c.id === "string" && c.id
      ? c.id
      : typeof c._id === "string" && c._id
      ? c._id
      : String(c._id || c.id || "");
  const columnId =
    typeof c.columnId === "string" && c.columnId
      ? c.columnId
      : typeof c._columnId === "string" && c._columnId
      ? c._columnId
      : String(c.columnId || "");
  return {
    ...c,
    id,
    columnId,
  } as Card;
}

export function normalizeColumn(raw: unknown): BoardColumn {
  if (!raw || typeof raw !== "object") return raw as BoardColumn;
  const c = raw as Record<string, unknown>;
  const id =
    typeof c.id === "string" && c.id
      ? c.id
      : typeof c._id === "string" && c._id
      ? c._id
      : String(c._id || c.id || "");
  const rawCards = Array.isArray(c.cards) ? c.cards : [];
  return {
    ...c,
    id,
    cards: rawCards.map(normalizeCard),
  } as BoardColumn;
}

export function normalizeProject(raw: unknown): Project {
  if (!raw || typeof raw !== "object") return raw as Project;
  const p = raw as Record<string, unknown>;
  const id =
    typeof p.id === "string" && p.id
      ? p.id
      : typeof p._id === "string" && p._id
      ? p._id
      : String(p._id || p.id || "");
  return {
    ...p,
    id,
  } as Project;
}

export const boardService = {
  listProjects: async () => {
    const { projects } = await api.get<{ projects: Project[] }>("/api/projects");
    return (projects || []).map(normalizeProject);
  },
  createProject: async (name: string) => {
    const { project } = await api.post<{ project: Project }>("/api/projects", { name });
    return normalizeProject(project);
  },
  getBoard: async (projectId: string) => {
    const data = await api.get<{ project: Project; columns: BoardColumn[] }>(
      `/api/projects/${projectId}/board`
    );
    return {
      project: normalizeProject(data.project),
      columns: (data.columns || []).map(normalizeColumn),
    };
  },
  updateProject: async (id: string, name: string) => {
    const { project } = await api.put<{ project: Project }>(`/api/projects/${id}`, { name });
    return normalizeProject(project);
  },
  deleteProject: (id: string) => api.delete<{ ok: boolean }>(`/api/projects/${id}`),

  listColumns: async (projectId: string) => {
    const { columns } = await api.get<{ columns: BoardColumn[] }>(
      `/api/projects/${projectId}/columns`
    );
    return (columns || []).map(normalizeColumn);
  },
  updateColumn: async (projectId: string, columnId: string, name: string) => {
    const { column } = await api.put<{ column: BoardColumn }>(
      `/api/projects/${projectId}/columns/${columnId}`,
      { name }
    );
    return normalizeColumn(column);
  },

  listCards: async (projectId: string, columnId: string) => {
    const { cards } = await api.get<{ cards: Card[] }>(
      `/api/projects/${projectId}/columns/${columnId}/cards`
    );
    return (cards || []).map(normalizeCard);
  },
  createCard: async (projectId: string, columnId: string, title: string, details: string) => {
    const { card } = await api.post<{ card: Card }>(
      `/api/projects/${projectId}/columns/${columnId}/cards`,
      { title, details }
    );
    return normalizeCard(card);
  },
  updateCard: async (
    projectId: string,
    columnId: string,
    cardId: string,
    title: string,
    details: string
  ) => {
    const { card } = await api.put<{ card: Card }>(
      `/api/projects/${projectId}/columns/${columnId}/cards/${cardId}`,
      { title, details }
    );
    return normalizeCard(card);
  },
  deleteCard: (projectId: string, columnId: string, cardId: string) =>
    api.delete<{ ok: boolean }>(
      `/api/projects/${projectId}/columns/${columnId}/cards/${cardId}`
    ),
  moveCard: async (projectId: string, cardId: string, input: MoveCardInput) => {
    const { card } = await api.patch<{ card: Card }>(
      `/api/projects/${projectId}/cards/${cardId}/move`,
      input
    );
    return normalizeCard(card);
  },
};
