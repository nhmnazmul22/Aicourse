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

vi.mock("../services/ColumnService", () => ({
  columnService: {
    listColumns: vi.fn(),
    updateColumn: vi.fn(),
    deleteColumn: vi.fn(),
  },
}));

import { Request, Response, NextFunction } from "express";
import { columnService } from "../services/ColumnService";
import { columnController } from "./ColumnController";

describe("ColumnController", () => {
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

  it("list returns columns", async () => {
    mockReq.params = { id: "p1" };
    vi.mocked(columnService.listColumns).mockResolvedValue([
      { _id: "c1", name: "Backlog", position: 0 },
    ] as any);

    await columnController.list(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      columns: [{ _id: "c1", name: "Backlog", position: 0 }],
    });
  });

  it("update returns updated column", async () => {
    mockReq.params = { id: "p1", columnId: "c1" };
    mockReq.body = { name: "Updated" };
    vi.mocked(columnService.updateColumn).mockResolvedValue({
      _id: "c1",
      name: "Updated",
    } as any);

    await columnController.update(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      column: { _id: "c1", name: "Updated" },
    });
  });

  it("update returns 404 when not found", async () => {
    mockReq.params = { id: "p1", columnId: "c1" };
    mockReq.body = { name: "Updated" };
    vi.mocked(columnService.updateColumn).mockResolvedValue(null);

    await columnController.update(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    );
  });

  it("delete returns 204 when deleted", async () => {
    mockReq.params = { id: "p1", columnId: "c1" };
    vi.mocked(columnService.deleteColumn).mockResolvedValue(true);

    await columnController.delete(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.status).toHaveBeenCalledWith(204);
  });

  it("delete returns 404 when not found", async () => {
    mockReq.params = { id: "p1", columnId: "c1" };
    vi.mocked(columnService.deleteColumn).mockResolvedValue(false);

    await columnController.delete(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    );
  });
});
