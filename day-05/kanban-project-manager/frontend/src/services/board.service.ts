import { api } from "./api";

export type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: string;
  name: string;
  cards: Card[];
};

export type Card = {
  id: string;
  title: string;
  details: string;
  columnId: string;
  position: number;
};

export type MoveCardInput = {
  cardId: string;
  targetColumnId: string;
  targetIndex: number;
};

export const boardService = {
  listProjects: () => api.get<Project[]>("/api/projects"),
  createProject: (name: string) => api.post<Project>("/api/projects", { name }),
  updateProject: (id: string, name: string) =>
    api.put<Project>(`/api/projects/${id}`, { name }),
  deleteProject: (id: string) => api.delete<{ ok: boolean }>(`/api/projects/${id}`),

  listColumns: (projectId: string) =>
    api.get<BoardColumn[]>(`/api/projects/${projectId}/columns`),
  updateColumn: (projectId: string, columnId: string, name: string) =>
    api.put<BoardColumn>(
      `/api/projects/${projectId}/columns/${columnId}`,
      { name }
    ),

  listCards: (projectId: string, columnId: string) =>
    api.get<Card[]>(
      `/api/projects/${projectId}/columns/${columnId}/cards`
    ),
  createCard: (projectId: string, columnId: string, title: string, details: string) =>
    api.post<Card>(
      `/api/projects/${projectId}/columns/${columnId}/cards`,
      { title, details }
    ),
  updateCard: (
    projectId: string,
    columnId: string,
    cardId: string,
    title: string,
    details: string
  ) =>
    api.put<Card>(
      `/api/projects/${projectId}/columns/${columnId}/cards/${cardId}`,
      { title, details }
    ),
  deleteCard: (projectId: string, columnId: string, cardId: string) =>
    api.delete<{ ok: boolean }>(
      `/api/projects/${projectId}/columns/${columnId}/cards/${cardId}`
    ),
  moveCard: (projectId: string, cardId: string, input: MoveCardInput) =>
    api.patch<Card>(
      `/api/projects/${projectId}/cards/${cardId}/move`,
      input
    ),
};
