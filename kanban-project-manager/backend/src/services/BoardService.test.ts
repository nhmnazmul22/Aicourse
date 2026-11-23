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
  const MockObjectId = vi.fn((id: string) => ({ toString: () => id }));
  (MockObjectId as any).isValid = vi.fn(() => true);
  return {
    ...actual,
    Types: {
      ...actual.Types,
      ObjectId: MockObjectId,
    },
  };
});

vi.mock("../models/Project", () => ({
  Project: {
    findOne: vi.fn(),
  },
}));
vi.mock("../models/BoardColumn", () => ({
  BoardColumn: {
    find: vi.fn(),
  },
}));
vi.mock("../models/Card", () => ({
  Card: {
    find: vi.fn(),
  },
}));

import { boardService } from "./BoardService";
import { Project } from "../models/Project";
import { BoardColumn } from "../models/BoardColumn";
import { Card } from "../models/Card";

describe("BoardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getBoard returns null when project not found", async () => {
    vi.spyOn(Project, "findOne").mockResolvedValue(null);

    const result = await boardService.getBoard("user-123", "p1");

    expect(result).toBeNull();
  });

  it("getBoard returns project with columns and cards", async () => {
    const mockProject = { _id: "p1", name: "Project 1" };
    const mockColumns = [{ _id: "c1", name: "Backlog", position: 0 }];
    const mockCards = [{ _id: "card1", title: "Card 1", columnId: "c1" }];

    vi.spyOn(Project, "findOne").mockResolvedValue(mockProject as any);
    vi.spyOn(BoardColumn, "find").mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockColumns),
    } as any);
    vi.spyOn(Card, "find").mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockCards),
    } as any);

    const result = await boardService.getBoard("user-123", "p1");

    expect(result?.project).toEqual(mockProject);
    expect(result?.columns).toEqual([
      { ...mockColumns[0], cards: [mockCards[0]] },
    ]);
    expect(result?.cards).toEqual(mockCards);
  });
});
