import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "../src/services/api";
import { authService } from "../src/services/auth.service";
import { boardService } from "../src/services/board.service";

describe("api and services", () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("api.get fetches JSON data with credentials", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ message: "success" }),
    });

    const res = await api.get<{ message: string }>("/test");

    expect(mockFetch).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      })
    );
    expect(res).toEqual({ message: "success" });
  });

  it("api.post stringifies body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: "1" }),
    });

    const res = await api.post<{ id: string }>("/create", { name: "Test" });

    expect(mockFetch).toHaveBeenCalledWith(
      "/create",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      })
    );
    expect(res).toEqual({ id: "1" });
  });

  it("api handles 204 No Content", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const res = await api.delete<void>("/remove");
    expect(res).toBeUndefined();
  });

  it("api throws error with server error message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: "Invalid title" }),
    });

    await expect(api.get("/bad")).rejects.toThrow("Invalid title");
  });

  it("authService.me unwraps user object", async () => {
    const mockUser = { id: "u1", email: "test@example.com", name: "User" };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ user: mockUser }),
    });

    const user = await authService.me();
    expect(user).toEqual(mockUser);
  });

  it("boardService.listProjects unwraps projects", async () => {
    const mockProjects = [{ id: "p1", name: "Project 1" }];
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ projects: mockProjects }),
    });

    const projects = await boardService.listProjects();
    expect(projects).toEqual(mockProjects);
  });

  it("boardService.getBoard returns full board data", async () => {
    const mockBoard = {
      project: { id: "p1", name: "Project 1" },
      columns: [{ id: "c1", name: "Backlog", cards: [] }],
    };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockBoard),
    });

    const board = await boardService.getBoard("p1");
    expect(board).toEqual(mockBoard);
  });

  it("api includes Authorization header when token is in localStorage", async () => {
    const mockStorage: Record<string, string> = {
      "auth-storage": JSON.stringify({ state: { token: "stored-jwt-token" } }),
    };
    const prevWindow = (globalThis as unknown as Record<string, unknown>).window;
    const prevStorage = (globalThis as unknown as Record<string, unknown>).localStorage;

    (globalThis as unknown as Record<string, unknown>).window = {};
    (globalThis as unknown as Record<string, unknown>).localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    };

    try {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ ok: true }),
      });

      await api.get("/authenticated-endpoint");

      expect(mockFetch).toHaveBeenCalledWith(
        "/authenticated-endpoint",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer stored-jwt-token",
          }),
        })
      );
    } finally {
      (globalThis as unknown as Record<string, unknown>).window = prevWindow;
      (globalThis as unknown as Record<string, unknown>).localStorage = prevStorage;
    }
  });
});
