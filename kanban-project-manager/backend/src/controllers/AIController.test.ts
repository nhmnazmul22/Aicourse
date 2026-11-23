import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiController } from "./AIController";
import { boardService } from "../services/BoardService";
import { aiService } from "../services/AIService";
import { Project } from "../models/Project";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

vi.mock("../services/BoardService", () => ({
  boardService: {
    getBoard: vi.fn(),
  },
}));

vi.mock("../services/AIService", () => ({
  aiService: {
    handleMessage: vi.fn(),
  },
}));

vi.mock("../models/Project", () => ({
  Project: {
    findOne: vi.fn(),
  },
}));

describe("AIController", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      user: { userId: "507f1f77bcf86cd799439011" },
      body: {
        message: "Create a card for testing",
        projectId: "507f1f77bcf86cd799439012",
      },
    };
    mockRes = {
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("passes error to next when message is missing", async () => {
    mockReq.body = { projectId: "507f1f77bcf86cd799439012" };
    await aiController.board(mockReq as AuthenticatedRequest, mockRes as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Message is required", statusCode: 400 }));
  });

  it("finds latest project when projectId is not provided", async () => {
    mockReq.body = { message: "Hello AI" };
    const mockProject = { _id: { toString: () => "507f1f77bcf86cd799439099" } };
    vi.mocked(Project.findOne).mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockProject),
    } as any);

    vi.mocked(boardService.getBoard).mockResolvedValue({
      project: { id: "507f1f77bcf86cd799439099", name: "P1", userId: "507f1f77bcf86cd799439011" },
      columns: [],
      rawColumns: [],
      cards: [],
    } as any);

    vi.mocked(aiService.handleMessage).mockResolvedValue({
      response: "Sure thing!",
      updates: [],
    });

    await aiController.board(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(boardService.getBoard).toHaveBeenCalledWith("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439099");
    expect(mockRes.json).toHaveBeenCalledWith({ response: "Sure thing!", updates: [] });
  });

  it("passes 404 to next when no project is found", async () => {
    mockReq.body = { message: "Hello AI" };
    vi.mocked(Project.findOne).mockReturnValue({
      sort: vi.fn().mockResolvedValue(null),
    } as any);

    await aiController.board(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "No project found", statusCode: 404 }));
  });

  it("passes 404 to next when board is not found", async () => {
    vi.mocked(boardService.getBoard).mockResolvedValue(null as any);

    await aiController.board(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Board not found", statusCode: 404 }));
  });

  it("returns AI response on success", async () => {
    vi.mocked(boardService.getBoard).mockResolvedValue({
      project: { id: "507f1f77bcf86cd799439012", name: "P1", userId: "507f1f77bcf86cd799439011" },
      columns: [{ id: "c1", name: "Backlog", projectId: "507f1f77bcf86cd799439012", order: 0 }],
      rawColumns: [{ id: "c1", name: "Backlog", projectId: "507f1f77bcf86cd799439012", order: 0 }],
      cards: [],
    } as any);

    vi.mocked(aiService.handleMessage).mockResolvedValue({
      response: "Card created",
      updates: [{ type: "add", columnId: "c1", title: "Test card" }],
    });

    await aiController.board(mockReq as AuthenticatedRequest, mockRes as Response, next);

    expect(aiService.handleMessage).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      response: "Card created",
      updates: [{ type: "add", columnId: "c1", title: "Test card" }],
    });
  });
});
