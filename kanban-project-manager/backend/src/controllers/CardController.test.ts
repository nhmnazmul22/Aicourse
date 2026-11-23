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

vi.mock("../services/CardService", () => ({
  cardService: {
    listCards: vi.fn(),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    moveCard: vi.fn(),
  },
}));

import { Request, Response, NextFunction } from "express";
import { cardService } from "../services/CardService";
import { cardController } from "./CardController";

describe("CardController", () => {
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

  it("list returns cards", async () => {
    mockReq.params = { id: "p1", columnId: "c1" };
    vi.mocked(cardService.listCards).mockResolvedValue([
      { _id: "card1", title: "Card 1", position: 0 },
    ] as any);

    await cardController.list(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      cards: [{ _id: "card1", title: "Card 1", position: 0 }],
    });
  });

  it("create returns 201 with card", async () => {
    mockReq.params = { id: "p1", columnId: "c1" };
    mockReq.body = { title: "New Card", details: "details" };
    vi.mocked(cardService.createCard).mockResolvedValue({
      _id: "card1",
      title: "New Card",
    } as any);

    await cardController.create(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      card: { _id: "card1", title: "New Card" },
    });
  });

  it("create returns 400 when title missing", async () => {
    mockReq.params = { id: "p1", columnId: "c1" };
    mockReq.body = {};

    await cardController.create(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it("update returns updated card", async () => {
    mockReq.params = { id: "p1", columnId: "c1", cardId: "card1" };
    mockReq.body = { title: "Updated", details: "details" };
    vi.mocked(cardService.updateCard).mockResolvedValue({
      _id: "card1",
      title: "Updated",
    } as any);

    await cardController.update(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      card: { _id: "card1", title: "Updated" },
    });
  });

  it("delete returns 204 when deleted", async () => {
    mockReq.params = { id: "p1", columnId: "c1", cardId: "card1" };
    vi.mocked(cardService.deleteCard).mockResolvedValue(true);

    await cardController.delete(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.status).toHaveBeenCalledWith(204);
  });

  it("delete returns 404 when not found", async () => {
    mockReq.params = { id: "p1", columnId: "c1", cardId: "card1" };
    vi.mocked(cardService.deleteCard).mockResolvedValue(false);

    await cardController.delete(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    );
  });
});
