import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../config/env", () => ({
  env: {
    PORT: 3001,
    DB_URL: "mongodb://localhost:27017/test",
    DB_NAME: "test",
    JWT_SECRET: "test-secret-key-at-least-32-chars-long",
    OPEN_ROUTER_KEY: "test-openrouter-key",
    NODE_ENV: "test",
  },
}));

vi.mock("../services/AIService", () => ({
  aiService: {
    testConnection: vi.fn(),
  },
}));

import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/AIService";
import { aiTestController } from "./AITestController";

describe("AITestController", () => {
  let mockReq: any;
  let mockRes: any;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("test returns 200 with response", async () => {
    vi.mocked(aiService.testConnection).mockResolvedValue("The answer is 4.");

    await aiTestController.test(mockReq, mockRes, next);

    expect(mockRes.json).toHaveBeenCalledWith({
      ok: true,
      response: "The answer is 4.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("test passes errors to next", async () => {
    vi.mocked(aiService.testConnection).mockRejectedValue(
      new Error("OpenRouter error")
    );

    await aiTestController.test(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: "OpenRouter error",
    }));
  });
});
