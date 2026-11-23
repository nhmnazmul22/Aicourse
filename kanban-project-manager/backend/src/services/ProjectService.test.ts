import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../config/env", () => ({
  env: {
    PORT: 3001,
    DB_URL: "mongodb://localhost:27017/test",
    DB_NAME: "test",
    JWT_SECRET: "test-secret-key-at-least-32-chars-long",
    NODE_ENV: "test",
  },
}));

vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongoose")>();
  return {
    ...actual,
    Types: {
      ...actual.Types,
      ObjectId: vi.fn((id: string) => ({ toString: () => id })),
    },
  };
});

vi.mock("../models/Project", () => ({
  Project: {
    find: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock("../models/BoardColumn", () => ({
  BoardColumn: {
    insertMany: vi.fn(),
    find: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("../models/Card", () => ({
  Card: {
    deleteMany: vi.fn(),
  },
}));

import { projectService } from "./ProjectService";
import { Project } from "../models/Project";
import { BoardColumn } from "../models/BoardColumn";
import { Card } from "../models/Card";

describe("ProjectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listProjects returns user's projects", async () => {
    const mockProjects = [{ _id: "p1", name: "Project 1" }];
    vi.spyOn(Project, "find").mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockProjects),
    } as any);

    const result = await projectService.listProjects("user-123");

    expect(Project.find).toHaveBeenCalledWith({
      userId: expect.anything(),
    });
    expect(result).toEqual(mockProjects);
  });

  it("createProject creates project and initializes 5 default columns", async () => {
    const mockProject = { _id: "p1", name: "New Project", userId: "user-123" };
    vi.spyOn(Project, "create").mockResolvedValue(mockProject as any);
    vi.spyOn(BoardColumn, "insertMany").mockResolvedValue([] as any);

    const result = await projectService.createProject("user-123", "New Project");

    expect(Project.create).toHaveBeenCalledWith({
      name: "New Project",
      userId: expect.anything(),
    });
    expect(BoardColumn.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Backlog", position: 0 }),
        expect.objectContaining({ name: "To do", position: 1 }),
        expect.objectContaining({ name: "In progress", position: 2 }),
        expect.objectContaining({ name: "Review", position: 3 }),
        expect.objectContaining({ name: "Done", position: 4 }),
      ])
    );
    expect(result).toEqual(mockProject);
  });

  it("updateProject updates and returns project", async () => {
    const mockProject = { _id: "p1", name: "Updated", userId: "user-123" };
    vi.spyOn(Project, "findOneAndUpdate").mockResolvedValue(mockProject as any);

    const result = await projectService.updateProject(
      "user-123",
      "p1",
      "Updated"
    );

    expect(result).toEqual(mockProject);
  });

  it("deleteProject returns true when deleted and cascades to columns and cards", async () => {
    vi.spyOn(Project, "findOne").mockResolvedValue({ _id: "p1" } as any);
    vi.spyOn(BoardColumn, "find").mockResolvedValue([{ _id: "col-1" }] as any);
    vi.spyOn(Card, "deleteMany").mockResolvedValue({} as any);
    vi.spyOn(BoardColumn, "deleteMany").mockResolvedValue({} as any);
    vi.spyOn(Project, "deleteOne").mockResolvedValue({ deletedCount: 1 } as any);

    const result = await projectService.deleteProject("user-123", "p1");

    expect(Card.deleteMany).toHaveBeenCalled();
    expect(BoardColumn.deleteMany).toHaveBeenCalled();
    expect(Project.deleteOne).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("deleteProject returns false when not found", async () => {
    vi.spyOn(Project, "findOne").mockResolvedValue(null);

    const result = await projectService.deleteProject("user-123", "p1");

    expect(result).toBe(false);
  });

  it("getProjectById returns project", async () => {
    const mockProject = { _id: "p1", name: "Project 1" };
    vi.spyOn(Project, "findOne").mockResolvedValue(mockProject as any);

    const result = await projectService.getProjectById("user-123", "p1");

    expect(result).toEqual(mockProject);
  });
});
