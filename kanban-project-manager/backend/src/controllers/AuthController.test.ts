import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/env", () => ({
  env: {
    PORT: 3001,
    DB_URL: "mongodb://localhost:27017/test",
    DB_NAME: "test",
    JWT_SECRET: "test-secret-key-at-least-32-chars-long",
    NODE_ENV: "test",
  },
}));

import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { authController } from "../controllers/AuthController";

vi.mock("../services/AuthService", () => ({
  authService: {
    signup: vi.fn(),
    login: vi.fn(),
    getUserById: vi.fn(),
  },
}));

describe("AuthController", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = { body: {}, cookies: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("signup returns 201 and sets cookie", async () => {
    mockReq.body = { email: "test@example.com", name: "Test", password: "pw" };
    vi.mocked(authService.signup).mockResolvedValue({
      user: { id: "1", email: "test@example.com", name: "Test" },
      token: "mock-token",
    } as any);

    await authController.signup(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "token",
      "mock-token",
      expect.objectContaining({ httpOnly: true })
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      user: { id: "1", email: "test@example.com", name: "Test" },
      token: "mock-token",
    });
  });

  it("login returns 200 and sets cookie", async () => {
    mockReq.body = { email: "test@example.com", password: "pw" };
    vi.mocked(authService.login).mockResolvedValue({
      user: { id: "1", email: "test@example.com", name: "Test" },
      token: "mock-token",
    } as any);

    await authController.login(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "token",
      "mock-token",
      expect.objectContaining({ httpOnly: true })
    );
  });

  it("logout clears cookie and returns ok", async () => {
    await authController.logout(mockReq as Request, mockRes as Response);

    expect(mockRes.clearCookie).toHaveBeenCalledWith("token", { path: "/" });
    expect(mockRes.json).toHaveBeenCalledWith({ ok: true });
  });

  it("me returns user when authenticated", async () => {
    (mockReq as any).user = { userId: "user-123" };
    vi.mocked(authService.getUserById).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      name: "Test",
    } as any);

    await authController.me(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      user: { id: "user-123", email: "test@example.com", name: "Test" },
    });
  });

  it("me returns 401 when not authenticated", async () => {
    await authController.me(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});
