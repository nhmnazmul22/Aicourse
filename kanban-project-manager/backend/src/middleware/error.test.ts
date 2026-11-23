import { describe, it, expect, vi } from "vitest";
import { errorMiddleware, notFoundHandler, AppError } from "./error";
import { Request, Response } from "express";

describe("errorMiddleware", () => {
  const mockReq = {} as Request;
  const mockNext = vi.fn();

  it("handles AppError with custom status code", () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new AppError("Not allowed", 403);
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Not allowed" });
  });

  it("handles error with statusCode property", () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = Object.assign(new Error("Bad input"), { statusCode: 400 });
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Bad input" });
  });

  it("handles ValidationError with 400", () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new Error("Title is required");
    error.name = "ValidationError";
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Title is required" });
  });

  it("handles CastError with 400 and friendly message", () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new Error("Cast to ObjectId failed");
    error.name = "CastError";
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid resource ID" });
  });

  it("handles Mongo duplicate key with 409", () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = Object.assign(new Error("E11000 duplicate key error"), { code: 11000 });
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Duplicate field value" });
  });

  it("handles unknown error with 500", () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const error = new Error("Something broke");
    errorMiddleware(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});

describe("notFoundHandler", () => {
  it("responds with 404 and Not found", () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    notFoundHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Not found" });
  });
});
