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

vi.mock("../models/Card", () => ({
  Card: {
    find: vi.fn(),
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
  },
}));

import { cardService } from "./CardService";
import { Card } from "../models/Card";

describe("CardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("createCard creates and returns card", async () => {
    const mockCard = { _id: "card1", title: "New Card", columnId: "c1" };
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
      position: 0,
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

  it("deleteCard returns true when deleted", async () => {
    vi.spyOn(Card, "deleteOne").mockResolvedValue({ deletedCount: 1 } as any);

    const result = await cardService.deleteCard(
      "user-123",
      "p1",
      "c1",
      "card1"
    );

    expect(result).toBe(true);
  });

  it("deleteCard returns false when not found", async () => {
    vi.spyOn(Card, "deleteOne").mockResolvedValue({ deletedCount: 0 } as any);

    const result = await cardService.deleteCard(
      "user-123",
      "p1",
      "c1",
      "card1"
    );

    expect(result).toBe(false);
  });

  it("moveCard moves card to target column", async () => {
    const mockCard = { _id: "card1", columnId: "c1" };
    vi.spyOn(Card, "findById").mockResolvedValue(mockCard as any);
    vi.spyOn(Card, "updateMany").mockResolvedValue({} as any);
    vi.spyOn(Card, "findByIdAndUpdate").mockResolvedValue({
      _id: "card1",
      columnId: "c2",
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
