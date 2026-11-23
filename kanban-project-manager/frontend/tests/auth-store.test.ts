import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "../src/lib/auth-store";
import { authService } from "../src/services/auth.service";

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({ user: null, token: null, isLoading: false });
  });

  it("sets auth credentials", () => {
    const mockUser = { id: "u1", email: "test@example.com", name: "Tester", createdAt: "2026-01-01" };
    useAuthStore.getState().setAuth(mockUser, "token-123");

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe("token-123");
  });

  it("clears credentials on logout", () => {
    const mockUser = { id: "u1", email: "test@example.com", name: "Tester", createdAt: "2026-01-01" };
    useAuthStore.getState().setAuth(mockUser, "token-123");

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("handles successful login", async () => {
    const mockUser = { id: "u1", email: "test@example.com", name: "Tester", createdAt: "2026-01-01" };
    vi.spyOn(authService, "login").mockResolvedValue({ user: mockUser, token: "token-abc" });

    await useAuthStore.getState().login("test@example.com", "password123");

    expect(authService.login).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe("token-abc");
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("handles login failure", async () => {
    vi.spyOn(authService, "login").mockRejectedValue(new Error("Invalid credentials"));

    await expect(useAuthStore.getState().login("test@example.com", "wrong")).rejects.toThrow("Invalid credentials");
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("handles successful signup", async () => {
    const mockUser = { id: "u2", email: "new@example.com", name: "Newbie", createdAt: "2026-01-01" };
    vi.spyOn(authService, "signup").mockResolvedValue({ user: mockUser, token: "token-new" });

    await useAuthStore.getState().signup({ email: "new@example.com", name: "Newbie", password: "pw" });

    expect(authService.signup).toHaveBeenCalledWith({ email: "new@example.com", name: "Newbie", password: "pw" });
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe("token-new");
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("handles signup failure", async () => {
    vi.spyOn(authService, "signup").mockRejectedValue(new Error("Email already registered"));

    await expect(useAuthStore.getState().signup({ email: "dup@example.com", name: "Dup", password: "pw" })).rejects.toThrow("Email already registered");
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("handles successful fetchMe", async () => {
    const mockUser = { id: "u1", email: "test@example.com", name: "Tester", createdAt: "2026-01-01" };
    vi.spyOn(authService, "me").mockResolvedValue(mockUser);

    await useAuthStore.getState().fetchMe();

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("handles fetchMe failure and clears state", async () => {
    useAuthStore.getState().setAuth({ id: "u1", email: "old@example.com", name: "Old", createdAt: "2026-01-01" }, "token-old");
    vi.spyOn(authService, "me").mockRejectedValue(new Error("Session expired"));

    await expect(useAuthStore.getState().fetchMe()).rejects.toThrow("Session expired");
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
