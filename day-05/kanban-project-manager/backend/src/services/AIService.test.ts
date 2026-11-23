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

describe("AIService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.OPEN_ROUTER_KEY = "test-openrouter-key";
  });

  it("parses create_card action and executes it", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "ACTION:create_card|projectId=p1|columnId=c1|title=New Card|details=Task details" } }],
      }),
    } as any);

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

    expect(result.actions.length).toBe(1);
    expect(result.actions[0].type).toBe("create_card");
    expect(Card.create).toHaveBeenCalledWith({
      title: "New Card",
      details: "Task details",
      columnId: "c1",
      position: 0,
    });
  });

  it("parses edit_card action", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "ACTION:edit_card|cardId=card1|title=Updated Title" } }],
      }),
    } as any);

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

    expect(result.actions.length).toBe(1);
    expect(result.actions[0].type).toBe("edit_card");
    expect(Card.findByIdAndUpdate).toHaveBeenCalledWith(
      "card1",
      { title: "Updated Title" },
      { new: true }
    );
  });

  it("parses move_card action", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "ACTION:move_card|cardId=card1|targetColumnId=c2|targetIndex=1" } }],
      }),
    } as any);

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

    expect(result.actions.length).toBe(1);
    expect(result.actions[0].type).toBe("move_card");
    expect(Card.findByIdAndUpdate).toHaveBeenCalledWith(
      "card1",
      { columnId: "c2", position: 1 },
      { new: true }
    );
  });

  it("returns none action when no action specified", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "I can help you with your Kanban board." } }],
      }),
    } as any);

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

    expect(result.actions).toEqual([]);
    expect(result.text).toContain("Kanban");
  });

  it("throws when OPEN_ROUTER_KEY is missing", async () => {
    vi.mocked(env).OPEN_ROUTER_KEY = "";
    await expect(
      aiService.handleMessage("user-123", "Hello", [], { projects: [], columns: [], cards: [] } as any)
    ).rejects.toThrow("OPEN_ROUTER_KEY is not configured");
  });
});
