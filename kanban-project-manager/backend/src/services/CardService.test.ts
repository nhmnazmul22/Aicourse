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
    findOne: vi.fn(),
  },
}));

vi.mock("../models/Card", () => ({
  Card: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
    updateMany: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../models/BoardColumn", () => ({
  BoardColumn: {
    find: vi.fn(),
    findOne: vi.fn(),
  },
}));

import { cardService } from "./CardService";
import { Card } from "../models/Card";
import { BoardColumn } from "../models/BoardColumn";
import { Project } from "../models/Project";

describe("CardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Project.findOne).mockResolvedValue({ _id: "p1", userId: "user-123" } as any);
    vi.mocked(BoardColumn.findOne).mockResolvedValue({ _id: "c1", projectId: "p1" } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws 404 when project or column does not belong to user", async () => {
    vi.mocked(Project.findOne).mockResolvedValue(null);

    await expect(cardService.listCards("user-123", "p1", "c1")).rejects.toThrow(
      "Project not found"
    );
  });

  it("listCards returns cards sorted by position", async () => {
    const mockCards = [{ _id: "card1", title: "Card 1", position: 0 }];
    vi.spyOn(Card, "find").mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockCards),
    } as any);

    const result = await cardService.listCards("user-123", "p1", "c1");

    expect(Card.find).toHaveBeenCalledWith({
      columnId: expect.anything(),
    });
    expect(result).toEqual(mockCards);
  });

  it("createCard creates and returns card with auto position", async () => {
    const mockCard = { _id: "card1", title: "New Card", columnId: "c1", position: 1 };
    vi.spyOn(Card, "findOne").mockResolvedValue({ position: 0 } as any);
    vi.spyOn(Card, "create").mockResolvedValue(mockCard as any);

    const result = await cardService.createCard(
      "user-123",
      "p1",
      "c1",
      "New Card",
      "details"
    );

    expect(Card.create).toHaveBeenCalledWith({
      title: "New Card",
      details: "details",
      columnId: expect.anything(),
      position: 1,
    });
    expect(result).toEqual(mockCard);
  });

  it("updateCard returns updated card", async () => {
    const mockCard = { _id: "card1", title: "Updated", columnId: "c1" };
    vi.spyOn(Card, "findOneAndUpdate").mockResolvedValue(mockCard as any);

    const result = await cardService.updateCard(
      "user-123",
      "p1",
      "c1",
      "card1",
      "Updated",
      "details"
    );

    expect(result).toEqual(mockCard);
  });

  it("deleteCard returns true when deleted and reorders remaining cards", async () => {
    vi.spyOn(Card, "findOne").mockResolvedValue({ _id: "card1", columnId: "c1", position: 0 } as any);
    vi.spyOn(Card, "deleteOne").mockResolvedValue({ deletedCount: 1 } as any);
    vi.spyOn(Card, "updateMany").mockResolvedValue({} as any);

    const result = await cardService.deleteCard(
      "user-123",
      "p1",
      "c1",
      "card1"
    );

    expect(Card.deleteOne).toHaveBeenCalled();
    expect(Card.updateMany).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("deleteCard returns false when not found", async () => {
    vi.spyOn(Card, "findOne").mockResolvedValue(null);

    const result = await cardService.deleteCard(
      "user-123",
      "p1",
      "c1",
      "card1"
    );

    expect(result).toBe(false);
  });

  it("moveCard moves card across columns", async () => {
    const mockCard = { _id: "card1", columnId: "c1", position: 0 };
    vi.spyOn(Card, "findById").mockResolvedValue(mockCard as any);
    vi.spyOn(Card, "updateMany").mockResolvedValue({} as any);
    vi.spyOn(Card, "findByIdAndUpdate").mockResolvedValue({
      _id: "card1",
      columnId: "c2",
      position: 2,
    } as any);

    const result = await cardService.moveCard(
      "user-123",
      "p1",
      "card1",
      "c2",
      2
    );

    expect(Card.updateMany).toHaveBeenCalledTimes(2);
    expect(result?._id).toEqual("card1");
  });

  it("moveCard reorders within the same column", async () => {
    const mockCard = { _id: "card1", columnId: "c1", position: 0 };
    vi.spyOn(Card, "findById").mockResolvedValue(mockCard as any);
    vi.spyOn(Card, "updateMany").mockResolvedValue({} as any);
    vi.spyOn(Card, "findByIdAndUpdate").mockResolvedValue({
      _id: "card1",
      columnId: "c1",
      position: 2,
    } as any);

    const result = await cardService.moveCard(
      "user-123",
      "p1",
      "card1",
      "c1",
      2
    );

    expect(Card.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ columnId: "c1" }),
      expect.objectContaining({ $inc: { position: -1 } })
    );
    expect(result?._id).toEqual("card1");
  });

  it("moveCard returns null when card not found", async () => {
    vi.spyOn(Card, "findById").mockResolvedValue(null);

    const result = await cardService.moveCard(
      "user-123",
      "p1",
      "card1",
      "c2",
      2
    );

    expect(result).toBeNull();
  });
});
