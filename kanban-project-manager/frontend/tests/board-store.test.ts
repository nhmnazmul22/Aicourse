import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBoardStore } from "../src/lib/board-store";
import { boardService } from "../src/services/board.service";

describe("useBoardStore", () => {
  const sampleProject = {
    id: "p1",
    name: "Project 1",
    userId: "u1",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  const sampleColumns = [
    {
      id: "col-1",
      name: "To do",
      cards: [
        { id: "card-1", title: "Task 1", details: "Detail 1", columnId: "col-1", position: 0 },
        { id: "card-2", title: "Task 2", details: "Detail 2", columnId: "col-1", position: 1 },
      ],
    },
    {
      id: "col-2",
      name: "Done",
      cards: [],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useBoardStore.setState({
      project: null,
      projects: [],
      columns: [],
      isLoading: false,
      error: null,
    });
  });

  it("loadBoard loads project and columns with cards", async () => {
    vi.spyOn(boardService, "getBoard").mockResolvedValue({
      project: sampleProject,
      columns: sampleColumns,
    });

    await useBoardStore.getState().loadBoard("p1");

    expect(boardService.getBoard).toHaveBeenCalledWith("p1");
    expect(useBoardStore.getState().project).toEqual(sampleProject);
    expect(useBoardStore.getState().columns).toEqual(sampleColumns);
    expect(useBoardStore.getState().isLoading).toBe(false);
  });

  it("loadBoard sets error on failure", async () => {
    vi.spyOn(boardService, "getBoard").mockRejectedValue(new Error("Network error"));

    await useBoardStore.getState().loadBoard("p1");

    expect(useBoardStore.getState().error).toBe("Network error");
    expect(useBoardStore.getState().isLoading).toBe(false);
  });

  it("loadProjects updates projects list", async () => {
    vi.spyOn(boardService, "listProjects").mockResolvedValue([sampleProject]);

    await useBoardStore.getState().loadProjects();

    expect(boardService.listProjects).toHaveBeenCalled();
    expect(useBoardStore.getState().projects).toEqual([sampleProject]);
  });

  it("createProject creates project and loads its board", async () => {
    const newProj = { ...sampleProject, id: "p2", name: "New Project" };
    vi.spyOn(boardService, "createProject").mockResolvedValue(newProj);
    vi.spyOn(boardService, "getBoard").mockResolvedValue({
      project: newProj,
      columns: sampleColumns,
    });
    vi.spyOn(boardService, "listProjects").mockResolvedValue([sampleProject, newProj]);

    await useBoardStore.getState().createProject("New Project");

    expect(boardService.createProject).toHaveBeenCalledWith("New Project");
    expect(useBoardStore.getState().project).toEqual(newProj);
  });

  it("updateProject updates active project name", async () => {
    useBoardStore.setState({ project: sampleProject });
    const updated = { ...sampleProject, name: "Renamed Project" };
    vi.spyOn(boardService, "updateProject").mockResolvedValue(updated);
    vi.spyOn(boardService, "listProjects").mockResolvedValue([updated]);

    await useBoardStore.getState().updateProject("Renamed Project");

    expect(boardService.updateProject).toHaveBeenCalledWith("p1", "Renamed Project");
    expect(useBoardStore.getState().project?.name).toBe("Renamed Project");
  });

  it("deleteProject deletes project and loads next available", async () => {
    const secondProj = { ...sampleProject, id: "p2", name: "Second Project" };
    useBoardStore.setState({ project: sampleProject, projects: [sampleProject, secondProj] });
    vi.spyOn(boardService, "deleteProject").mockResolvedValue({ ok: true });
    vi.spyOn(boardService, "listProjects").mockResolvedValue([secondProj]);
    vi.spyOn(boardService, "getBoard").mockResolvedValue({
      project: secondProj,
      columns: sampleColumns,
    });

    await useBoardStore.getState().deleteProject();

    expect(boardService.deleteProject).toHaveBeenCalledWith("p1");
    expect(useBoardStore.getState().project?.id).toBe("p2");
  });

  it("renameColumn optimistically updates column name and rolls back on failure", async () => {
    useBoardStore.setState({ project: sampleProject, columns: sampleColumns });
    vi.spyOn(boardService, "updateColumn").mockResolvedValue({
      id: "col-1",
      name: "In Progress",
      cards: sampleColumns[0].cards,
    });

    await useBoardStore.getState().renameColumn("col-1", "In Progress");

    expect(useBoardStore.getState().columns[0].name).toBe("In Progress");

    vi.spyOn(boardService, "updateColumn").mockRejectedValue(new Error("Server error"));
    await expect(useBoardStore.getState().renameColumn("col-1", "Failed Name")).rejects.toThrow("Server error");
    expect(useBoardStore.getState().columns[0].name).toBe("In Progress");
  });

  it("addCard optimistically adds card and updates with server returned card", async () => {
    useBoardStore.setState({ project: sampleProject, columns: sampleColumns });
    const serverCard = { id: "card-real-99", title: "New Task", details: "Notes", columnId: "col-1", position: 2 };
    vi.spyOn(boardService, "createCard").mockResolvedValue(serverCard);

    await useBoardStore.getState().addCard("col-1", "New Task", "Notes");

    expect(boardService.createCard).toHaveBeenCalledWith("p1", "col-1", "New Task", "Notes");
    const cards = useBoardStore.getState().columns[0].cards;
    expect(cards).toHaveLength(3);
    expect(cards[2].id).toBe("card-real-99");
  });

  it("updateCard updates title and details optimistically", async () => {
    useBoardStore.setState({ project: sampleProject, columns: sampleColumns });
    const updatedCard = { id: "card-1", title: "Edited Title", details: "Edited Details", columnId: "col-1", position: 0 };
    vi.spyOn(boardService, "updateCard").mockResolvedValue(updatedCard);

    await useBoardStore.getState().updateCard("card-1", "col-1", "Edited Title", "Edited Details");

    expect(boardService.updateCard).toHaveBeenCalledWith("p1", "col-1", "card-1", "Edited Title", "Edited Details");
    expect(useBoardStore.getState().columns[0].cards[0].title).toBe("Edited Title");
  });

  it("deleteCard removes card optimistically", async () => {
    useBoardStore.setState({ project: sampleProject, columns: sampleColumns });
    vi.spyOn(boardService, "deleteCard").mockResolvedValue({ ok: true });

    await useBoardStore.getState().deleteCard("card-1", "col-1");

    expect(boardService.deleteCard).toHaveBeenCalledWith("p1", "col-1", "card-1");
    expect(useBoardStore.getState().columns[0].cards).toHaveLength(1);
    expect(useBoardStore.getState().columns[0].cards[0].id).toBe("card-2");
  });

  it("moveCard moves card across columns", async () => {
    useBoardStore.setState({ project: sampleProject, columns: sampleColumns });
    vi.spyOn(boardService, "moveCard").mockResolvedValue({
      id: "card-1",
      title: "Task 1",
      details: "Detail 1",
      columnId: "col-2",
      position: 0,
    });

    await useBoardStore.getState().moveCard("card-1", "col-2", 0);

    expect(useBoardStore.getState().columns[0].cards.map((c) => c.id)).toEqual(["card-2"]);
    expect(useBoardStore.getState().columns[1].cards.map((c) => c.id)).toEqual(["card-1"]);
  });
});
