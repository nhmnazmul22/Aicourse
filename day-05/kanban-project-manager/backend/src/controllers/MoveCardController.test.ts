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
    moveCard: vi.fn(),
  },
}));

import { Request, Response, NextFunction } from "express";
import { cardService } from "../services/CardService";
import { moveCardController } from "./MoveCardController";

describe("MoveCardController", () => {
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

  it("move returns moved card", async () => {
    mockReq.params = { id: "p1", cardId: "card1" };
    mockReq.body = { targetColumnId: "c2", targetIndex: 2 };
    vi.mocked(cardService.moveCard).mockResolvedValue({
      _id: "card1",
      columnId: "c2",
    } as any);

    await moveCardController.move(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      card: { _id: "card1", columnId: "c2" },
    });
  });

  it("move returns 400 when targetColumnId missing", async () => {
    mockReq.params = { id: "p1", cardId: "card1" };
    mockReq.body = { targetIndex: 2 };

    await moveCardController.move(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it("move returns 400 when targetIndex missing", async () => {
    mockReq.params = { id: "p1", cardId: "card1" };
    mockReq.body = { targetColumnId: "c2" };

    await moveCardController.move(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it("move returns 404 when card not found", async () => {
    mockReq.params = { id: "p1", cardId: "card1" };
    mockReq.body = { targetColumnId: "c2", targetIndex: 2 };
    vi.mocked(cardService.moveCard).mockResolvedValue(null);

    await moveCardController.move(
      mockReq as Request,
      mockRes as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    );
  });
});
