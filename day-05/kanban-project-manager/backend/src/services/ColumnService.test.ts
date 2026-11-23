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

vi.mock("../models/BoardColumn", () => ({
  BoardColumn: {
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

import { columnService } from "./ColumnService";
import { BoardColumn } from "../models/BoardColumn";

describe("ColumnService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listColumns returns columns sorted by position", async () => {
    const mockColumns = [{ _id: "c1", name: "Backlog", position: 0 }];
    vi.spyOn(BoardColumn, "find").mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockColumns),
    } as any);

    const result = await columnService.listColumns("user-123", "p1");

    expect(BoardColumn.find).toHaveBeenCalledWith({
      projectId: expect.anything(),
    });
    expect(result).toEqual(mockColumns);
  });

  it("updateColumn returns updated column", async () => {
    const mockColumn = { _id: "c1", name: "Updated", position: 0 };
    vi.spyOn(BoardColumn, "findOneAndUpdate").mockResolvedValue(
      mockColumn as any
    );

    const result = await columnService.updateColumn(
      "user-123",
      "p1",
      "c1",
      "Updated"
    );

    expect(result).toEqual(mockColumn);
  });

  it("deleteColumn returns true when deleted", async () => {
    vi.spyOn(BoardColumn, "deleteOne").mockResolvedValue({
      deletedCount: 1,
    } as any);

    const result = await columnService.deleteColumn("user-123", "p1", "c1");

    expect(result).toBe(true);
  });

  it("deleteColumn returns false when not found", async () => {
    vi.spyOn(BoardColumn, "deleteOne").mockResolvedValue({
      deletedCount: 0,
    } as any);

    const result = await columnService.deleteColumn("user-123", "p1", "c1");

    expect(result).toBe(false);
  });
});
