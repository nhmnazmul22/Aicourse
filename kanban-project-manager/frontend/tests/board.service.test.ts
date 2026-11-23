import { describe, it, expect, vi, beforeEach } from "vitest";
import { boardService } from "../src/services/board.service";
import { api } from "../src/services/api";

describe("boardService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("listProjects fetches projects and unwraps data", async () => {
    const mockProjects = [{ id: "p1", name: "Project 1", userId: "u1", createdAt: "2026-01-01", updatedAt: "2026-01-01" }];
    vi.spyOn(api, "get").mockResolvedValue({ projects: mockProjects });

    const result = await boardService.listProjects();

    expect(api.get).toHaveBeenCalledWith("/api/projects");
    expect(result).toEqual(mockProjects);
  });

  it("createProject sends POST and returns unwrapped project", async () => {
    const mockProject = { id: "p2", name: "New Project", userId: "u1", createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    vi.spyOn(api, "post").mockResolvedValue({ project: mockProject });

    const result = await boardService.createProject("New Project");

    expect(api.post).toHaveBeenCalledWith("/api/projects", { name: "New Project" });
    expect(result).toEqual(mockProject);
  });

  it("getBoard fetches board with project and columns", async () => {
    const mockBoard = {
      project: { id: "p1", name: "Project 1", userId: "u1", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
      columns: [{ id: "c1", name: "Backlog", cards: [] }],
    };
    vi.spyOn(api, "get").mockResolvedValue(mockBoard);

    const result = await boardService.getBoard("p1");

    expect(api.get).toHaveBeenCalledWith("/api/projects/p1/board");
    expect(result).toEqual(mockBoard);
  });

  it("updateProject sends PUT and returns project", async () => {
    const mockProject = { id: "p1", name: "Renamed", userId: "u1", createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    vi.spyOn(api, "put").mockResolvedValue({ project: mockProject });

    const result = await boardService.updateProject("p1", "Renamed");

    expect(api.put).toHaveBeenCalledWith("/api/projects/p1", { name: "Renamed" });
    expect(result).toEqual(mockProject);
  });

  it("deleteProject sends DELETE request", async () => {
    vi.spyOn(api, "delete").mockResolvedValue({ ok: true });

    const result = await boardService.deleteProject("p1");

    expect(api.delete).toHaveBeenCalledWith("/api/projects/p1");
    expect(result).toEqual({ ok: true });
  });

  it("listColumns sends GET and returns columns", async () => {
    const mockCols = [{ id: "c1", name: "To do", cards: [] }];
    vi.spyOn(api, "get").mockResolvedValue({ columns: mockCols });

    const result = await boardService.listColumns("p1");

    expect(api.get).toHaveBeenCalledWith("/api/projects/p1/columns");
    expect(result).toEqual(mockCols);
  });

  it("updateColumn sends PUT and returns column", async () => {
    const mockCol = { id: "c1", name: "Ready", cards: [] };
    vi.spyOn(api, "put").mockResolvedValue({ column: mockCol });

    const result = await boardService.updateColumn("p1", "c1", "Ready");

    expect(api.put).toHaveBeenCalledWith("/api/projects/p1/columns/c1", { name: "Ready" });
    expect(result).toEqual(mockCol);
  });

  it("listCards sends GET and returns cards", async () => {
    const mockCards = [{ id: "card-1", title: "Task 1", details: "Detail", columnId: "c1", position: 0 }];
    vi.spyOn(api, "get").mockResolvedValue({ cards: mockCards });

    const result = await boardService.listCards("p1", "c1");

    expect(api.get).toHaveBeenCalledWith("/api/projects/p1/columns/c1/cards");
    expect(result).toEqual(mockCards);
  });

  it("createCard sends POST and returns card", async () => {
    const mockCard = { id: "card-2", title: "New Task", details: "Notes", columnId: "c1", position: 1 };
    vi.spyOn(api, "post").mockResolvedValue({ card: mockCard });

    const result = await boardService.createCard("p1", "c1", "New Task", "Notes");

    expect(api.post).toHaveBeenCalledWith("/api/projects/p1/columns/c1/cards", { title: "New Task", details: "Notes" });
    expect(result).toEqual(mockCard);
  });

  it("updateCard sends PUT and returns card", async () => {
    const mockCard = { id: "card-1", title: "Updated", details: "Updated notes", columnId: "c1", position: 0 };
    vi.spyOn(api, "put").mockResolvedValue({ card: mockCard });

    const result = await boardService.updateCard("p1", "c1", "card-1", "Updated", "Updated notes");

    expect(api.put).toHaveBeenCalledWith("/api/projects/p1/columns/c1/cards/card-1", { title: "Updated", details: "Updated notes" });
    expect(result).toEqual(mockCard);
  });

  it("deleteCard sends DELETE request", async () => {
    vi.spyOn(api, "delete").mockResolvedValue({ ok: true });

    const result = await boardService.deleteCard("p1", "c1", "card-1");

    expect(api.delete).toHaveBeenCalledWith("/api/projects/p1/columns/c1/cards/card-1");
    expect(result).toEqual({ ok: true });
  });

  it("moveCard sends PATCH and returns card", async () => {
    const mockCard = { id: "card-1", title: "Task", details: "Detail", columnId: "c2", position: 0 };
    vi.spyOn(api, "patch").mockResolvedValue({ card: mockCard });

    const result = await boardService.moveCard("p1", "card-1", { cardId: "card-1", targetColumnId: "c2", targetIndex: 0 });

    expect(api.patch).toHaveBeenCalledWith("/api/projects/p1/cards/card-1/move", { cardId: "card-1", targetColumnId: "c2", targetIndex: 0 });
    expect(result).toEqual(mockCard);
  });

  it("normalizes project with _id into id", async () => {
    const rawProject = { _id: "raw-proj-id", name: "Raw Project" };
    vi.spyOn(api, "get").mockResolvedValue({
      projects: [rawProject as unknown as import("../src/services/board.service").Project],
    });

    const result = await boardService.listProjects();

    expect(result[0].id).toBe("raw-proj-id");
    expect(result[0].name).toBe("Raw Project");
  });
});
