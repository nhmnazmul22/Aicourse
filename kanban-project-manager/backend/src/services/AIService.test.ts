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

vi.mock("../models/Card", () => ({
  Card: {
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../models/BoardColumn", () => ({
  BoardColumn: {
    findOne: vi.fn(),
  },
}));

import { env } from "../config/env";
import { aiService } from "./AIService";
import { Card } from "../models/Card";
import { BoardColumn } from "../models/BoardColumn";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function mockAIResponse(content: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
  } as any);
}

describe("AIService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.OPEN_ROUTER_KEY = "test-openrouter-key";
  });

  it("parses structured AI response with add update", async () => {
    mockAIResponse({
      response: "I've added a new card.",
      updates: [{ type: "add", columnId: "c1", title: "New Card", details: "Task details" }],
    });

    vi.spyOn(Card, "create").mockResolvedValue({} as any);

    const result = await aiService.handleMessage(
      "user-123",
      "Create a new card",
      [],
      {
        projects: [{ _id: "p1", name: "Project 1" }],
        columns: [{ _id: "c1", name: "To Do", projectId: "p1" }],
        cards: [],
      } as any
    );

    expect(result.response).toBe("I've added a new card.");
    expect(result.updates!).toHaveLength(1);
    expect(result.updates![0].type).toBe("add");
    expect(Card.create).toHaveBeenCalledWith({
      title: "New Card",
      details: "Task details",
      columnId: "c1",
      position: 0,
    });
  });

  it("parses structured AI response with edit update", async () => {
    mockAIResponse({
      response: "I've updated the card.",
      updates: [{ type: "edit", cardId: "card1", title: "Updated Title" }],
    });

    vi.spyOn(Card, "findByIdAndUpdate").mockResolvedValue({} as any);

    const result = await aiService.handleMessage(
      "user-123",
      "Edit the card",
      [],
      {
        projects: [{ _id: "p1", name: "Project 1" }],
        columns: [],
        cards: [{ _id: "card1", title: "Old Title", columnId: "c1" }],
      } as any
    );

    expect(result.response).toBe("I've updated the card.");
    expect(result.updates!).toHaveLength(1);
    expect(result.updates![0].type).toBe("edit");
    expect(Card.findByIdAndUpdate).toHaveBeenCalledWith(
      "card1",
      { title: "Updated Title" },
      { new: true }
    );
  });

  it("parses structured AI response with delete update", async () => {
    mockAIResponse({
      response: "I've deleted the card.",
      updates: [{ type: "delete", cardId: "card1" }],
    });

    vi.spyOn(Card, "findByIdAndDelete").mockResolvedValue({} as any);

    const result = await aiService.handleMessage(
      "user-123",
      "Delete the card",
      [],
      {
        projects: [{ _id: "p1", name: "Project 1" }],
        columns: [],
        cards: [{ _id: "card1", title: "Card 1", columnId: "c1" }],
      } as any
    );

    expect(result.response).toBe("I've deleted the card.");
    expect(result.updates!).toHaveLength(1);
    expect(result.updates![0].type).toBe("delete");
    expect(Card.findByIdAndDelete).toHaveBeenCalledWith("card1");
  });

  it("parses structured AI response with move update", async () => {
    mockAIResponse({
      response: "I've moved the card.",
      updates: [{ type: "move", cardId: "card1", targetColumnId: "c2", targetIndex: 1 }],
    });

    vi.spyOn(Card, "findByIdAndUpdate").mockResolvedValue({} as any);

    const result = await aiService.handleMessage(
      "user-123",
      "Move the card",
      [],
      {
        projects: [{ _id: "p1", name: "Project 1" }],
        columns: [],
        cards: [{ _id: "card1", title: "Card 1", columnId: "c1" }],
      } as any
    );

    expect(result.response).toBe("I've moved the card.");
    expect(result.updates!).toHaveLength(1);
    expect(result.updates![0].type).toBe("move");
    expect(Card.findByIdAndUpdate).toHaveBeenCalledWith(
      "card1",
      { columnId: "c2", position: 1 },
      { new: true }
    );
  });

  it("returns empty updates when no updates specified", async () => {
    mockAIResponse({
      response: "I can help you with your Kanban board.",
      updates: [],
    });

    const result = await aiService.handleMessage(
      "user-123",
      "Hello",
      [],
      {
        projects: [],
        columns: [],
        cards: [],
      } as any
    );

    expect(result.response).toBe("I can help you with your Kanban board.");
    expect(result.updates!).toEqual([]);
  });

  it("throws when AI output is invalid JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "Not valid JSON" } }],
      }),
    } as any);

    await expect(
      aiService.handleMessage("user-123", "Hello", [], { projects: [], columns: [], cards: [] } as any)
    ).rejects.toThrow("Invalid AI output");
  });

  it("throws when OPEN_ROUTER_KEY is missing", async () => {
    vi.mocked(env).OPEN_ROUTER_KEY = "";
    await expect(
      aiService.handleMessage("user-123", "Hello", [], { projects: [], columns: [], cards: [] } as any)
    ).rejects.toThrow("OPEN_ROUTER_KEY is not configured");
  });

  it("testConnection returns response containing 4", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "2+2 equals 4" } }],
      }),
    } as any);

    const result = await aiService.testConnection();

    expect(result).toBe("2+2 equals 4");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-openrouter-key",
        }),
        body: expect.stringContaining("2+2"),
      })
    );
  });

  it("testConnection throws when response does not contain 4", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "The answer is 5" } }],
      }),
    } as any);

    await expect(aiService.testConnection()).rejects.toThrow(
      "Unexpected OpenRouter response"
    );
  });
});
