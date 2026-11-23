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

vi.mock("../services/ProjectService", () => ({
  projectService: {
    listProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/ProjectService";
import { projectController } from "./ProjectController";

describe("ProjectController", () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = { user: { userId: "user-123" }, params: {}, body: {} } as any;
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("list returns projects", async () => {
    vi.mocked(projectService.listProjects).mockResolvedValue([
      { _id: "p1", name: "Project 1" },
    ] as any);

    await projectController.list(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      projects: [{ _id: "p1", name: "Project 1" }],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("create returns 201 with project", async () => {
    mockReq.body = { name: "New Project" };
    vi.mocked(projectService.createProject).mockResolvedValue({
      _id: "p1",
      name: "New Project",
    } as any);

    await projectController.create(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      project: { _id: "p1", name: "New Project" },
    });
  });

  it("create returns 400 when name missing", async () => {
    mockReq.body = {};

    await projectController.create(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it("update returns updated project", async () => {
    mockReq.params = { id: "p1" };
    mockReq.body = { name: "Updated" };
    vi.mocked(projectService.updateProject).mockResolvedValue({
      _id: "p1",
      name: "Updated",
    } as any);

    await projectController.update(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      project: { _id: "p1", name: "Updated" },
    });
  });

  it("update returns 404 when not found", async () => {
    mockReq.params = { id: "p1" };
    mockReq.body = { name: "Updated" };
    vi.mocked(projectService.updateProject).mockResolvedValue(null);

    await projectController.update(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    );
  });

  it("delete returns 204 when deleted", async () => {
    mockReq.params = { id: "p1" };
    vi.mocked(projectService.deleteProject).mockResolvedValue(true);

    await projectController.delete(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.send).toHaveBeenCalled();
  });

  it("delete returns 404 when not found", async () => {
    mockReq.params = { id: "p1" };
    vi.mocked(projectService.deleteProject).mockResolvedValue(false);

    await projectController.delete(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    );
  });
});
