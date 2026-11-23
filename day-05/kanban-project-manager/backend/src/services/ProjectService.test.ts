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

import { projectService } from "./ProjectService";
import { Project } from "../models/Project";

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

  it("createProject creates and returns project", async () => {
    const mockProject = { _id: "p1", name: "New Project", userId: "user-123" };
    vi.spyOn(Project, "create").mockResolvedValue(mockProject as any);

    const result = await projectService.createProject("user-123", "New Project");

    expect(Project.create).toHaveBeenCalledWith({
      name: "New Project",
      userId: expect.anything(),
    });
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

  it("deleteProject returns true when deleted", async () => {
    vi.spyOn(Project, "deleteOne").mockResolvedValue({ deletedCount: 1 } as any);

    const result = await projectService.deleteProject("user-123", "p1");

    expect(result).toBe(true);
  });

  it("deleteProject returns false when not found", async () => {
    vi.spyOn(Project, "deleteOne").mockResolvedValue({ deletedCount: 0 } as any);

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
