import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { authMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from "./auth";
import { Response, NextFunction } from "express";
import { env } from "../config/env";

describe("authMiddleware", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("returns 401 when no token is present", () => {
    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, next);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    mockReq.cookies = { token: "invalid-token" };
    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, next);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("authenticates valid cookie token and calls next", () => {
    const token = jwt.sign({ userId: "u123" }, env.JWT_SECRET);
    mockReq.cookies = { token };

    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(mockReq.user).toEqual({ userId: "u123" });
    expect(next).toHaveBeenCalled();
  });

  it("authenticates valid Bearer header token and calls next", () => {
    const token = jwt.sign({ userId: "u456" }, env.JWT_SECRET);
    mockReq.headers = { authorization: `Bearer ${token}` };

    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(mockReq.user).toEqual({ userId: "u456" });
    expect(next).toHaveBeenCalled();
  });
});

describe("optionalAuthMiddleware", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("calls next when no token is present without error", () => {
    optionalAuthMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, next);
    expect(next).toHaveBeenCalled();
    expect(mockReq.user).toBeUndefined();
  });

  it("sets user when valid token is present", () => {
    const token = jwt.sign({ userId: "u789" }, env.JWT_SECRET);
    mockReq.cookies = { token };

    optionalAuthMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(mockReq.user).toEqual({ userId: "u789" });
    expect(next).toHaveBeenCalled();
  });

  it("ignores invalid token and calls next", () => {
    mockReq.cookies = { token: "corrupted" };

    optionalAuthMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(mockReq.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
