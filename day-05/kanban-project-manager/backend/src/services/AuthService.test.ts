import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../config/env", () => ({
  env: {
    PORT: 3001,
    DB_URL: "mongodb://localhost:27017/test",
    DB_NAME: "test",
    JWT_SECRET: "test-secret-key-at-least-32-chars-long",
    NODE_ENV: "test",
  },
}));

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authService } from "../services/AuthService";

vi.mock("../models/User", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("bcryptjs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("bcryptjs")>();
  return {
    ...actual,
    hash: vi.fn(),
    compare: vi.fn(),
  };
});

vi.mock("jsonwebtoken", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jsonwebtoken")>();
  return {
    ...actual,
    sign: vi.fn(),
    verify: vi.fn(),
  };
});

const mockUser = {
  _id: "user-123",
  email: "test@example.com",
  name: "Test User",
  companyname: "Test Co",
  passwordHash: "hashed-password",
  avatarUrl: "http://example.com/avatar.png",
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject: function () {
    return {
      _id: this._id,
      email: this.email,
      name: this.name,
      companyname: this.companyname,
      passwordHash: this.passwordHash,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("signup creates user and returns token", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(null as any);
    vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as any);
    vi.spyOn(User, "create").mockResolvedValue(mockUser as any);
    vi.spyOn(jwt, "sign").mockReturnValue("mock-token" as any);

    const result = await authService.signup({
      email: "test@example.com",
      name: "Test User",
      companyname: "Test Co",
      password: "password123",
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(User.create).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Test User",
      companyname: "Test Co",
      passwordHash: "hashed-password",
      avatarUrl: undefined,
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: "user-123" },
      expect.any(String),
      { expiresIn: "7d" }
    );
    expect(result.token).toBe("mock-token");
    expect((result as any).user.passwordHash).toBeUndefined();
    expect(result.user.email).toBe("test@example.com");
  });

  it("signup rejects duplicate email", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(mockUser as any);
    await expect(
      authService.signup({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("login succeeds with valid credentials", async () => {
    vi.spyOn(User, "findOne").mockReturnValue({ select: vi.fn().mockResolvedValue(mockUser) } as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as any);
    vi.spyOn(jwt, "sign").mockReturnValue("mock-token" as any);

    const result = await authService.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.token).toBe("mock-token");
    expect(result.user.email).toBe("test@example.com");
  });

  it("login rejects wrong password", async () => {
    vi.spyOn(User, "findOne").mockReturnValue({ select: vi.fn().mockResolvedValue(mockUser) } as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(false as any);

    await expect(
      authService.login({
        email: "test@example.com",
        password: "wrong-password",
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("login rejects unknown email", async () => {
    vi.spyOn(User, "findOne").mockReturnValue({ select: vi.fn().mockResolvedValue(null) } as any);

    await expect(
      authService.login({
        email: "unknown@example.com",
        password: "password123",
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("getUserById returns public user", async () => {
    vi.spyOn(User, "findById").mockResolvedValue(mockUser as any);

    const result = await authService.getUserById("user-123");

    expect(result).toBeDefined();
    expect((result as any)?.passwordHash).toBeUndefined();
    expect(result?.email).toBe("test@example.com");
  });

  it("getUserById returns null for missing user", async () => {
    vi.spyOn(User, "findById").mockResolvedValue(null as any);

    const result = await authService.getUserById("missing");

    expect(result).toBeNull();
  });
});
