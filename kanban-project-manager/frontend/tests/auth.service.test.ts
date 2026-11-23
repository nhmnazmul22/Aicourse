import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../src/services/auth.service";
import { api } from "../src/services/api";

describe("authService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("signup sends POST to /api/auth/signup", async () => {
    const mockResponse = {
      user: { id: "u1", email: "test@example.com", name: "Tester", createdAt: "2026-01-01" },
      token: "jwt-token",
    };
    vi.spyOn(api, "post").mockResolvedValue(mockResponse);

    const input = { email: "test@example.com", password: "password123", name: "Tester" };
    const res = await authService.signup(input);

    expect(api.post).toHaveBeenCalledWith("/api/auth/signup", input);
    expect(res).toEqual(mockResponse);
  });

  it("login sends POST to /api/auth/login", async () => {
    const mockResponse = {
      user: { id: "u1", email: "test@example.com", name: "Tester", createdAt: "2026-01-01" },
      token: "jwt-token",
    };
    vi.spyOn(api, "post").mockResolvedValue(mockResponse);

    const input = { email: "test@example.com", password: "password123" };
    const res = await authService.login(input);

    expect(api.post).toHaveBeenCalledWith("/api/auth/login", input);
    expect(res).toEqual(mockResponse);
  });

  it("me sends GET to /api/auth/me and unwraps user", async () => {
    const mockUser = { id: "u1", email: "test@example.com", name: "Tester", createdAt: "2026-01-01" };
    vi.spyOn(api, "get").mockResolvedValue({ user: mockUser });

    const user = await authService.me();

    expect(api.get).toHaveBeenCalledWith("/api/auth/me");
    expect(user).toEqual(mockUser);
  });

  it("normalizes user with _id from raw MongoDB response", async () => {
    const rawUser = {
      _id: "6b03aaac4277b4d195dbe683",
      email: "nhmnazmul87@gmail.com",
      name: "Nazmul Hasan",
      companyname: "Nhm develop solutions",
      createdAt: "2026-11-23T02:53:32.688Z",
      updatedAt: "2026-11-23T02:53:32.688Z",
      __v: 0,
    };
    vi.spyOn(api, "post").mockResolvedValue({
      user: rawUser as unknown as import("../src/services/auth.service").User,
      token: "jwt-token-123",
    });

    const res = await authService.login({ email: "nhmnazmul87@gmail.com", password: "secret" });

    expect(res.user.id).toBe("6b03aaac4277b4d195dbe683");
    expect(res.user.email).toBe("nhmnazmul87@gmail.com");
  });

  it("logout sends POST to /api/auth/logout", async () => {
    vi.spyOn(api, "post").mockResolvedValue({ ok: true });

    const res = await authService.logout();

    expect(api.post).toHaveBeenCalledWith("/api/auth/logout");
    expect(res).toEqual({ ok: true });
  });
});
