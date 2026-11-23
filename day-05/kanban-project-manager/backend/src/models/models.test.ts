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

import mongoose from "mongoose";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { BoardColumn } from "../models/BoardColumn";
import { Card } from "../models/Card";

vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongoose")>();
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    connection: {
      dropDatabase: vi.fn().mockResolvedValue(undefined),
    },
    Types: actual.Types,
  };
});

describe("Model validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("User", () => {
    it("requires email, name, passwordHash", async () => {
      const user = new User({});
      let error: any;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }
      expect(error.errors.email).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.passwordHash).toBeDefined();
    });

    it("accepts optional companyname and avatarUrl", async () => {
      const user = new User({
        email: "optional@example.com",
        name: "Optional User",
        passwordHash: "hash",
        companyname: "Acme",
        avatarUrl: "http://example.com/avatar.png",
      });
      const validated = await user.validate();
      expect(validated).toBeUndefined();
      expect(user.companyname).toBe("Acme");
      expect(user.avatarUrl).toBe("http://example.com/avatar.png");
    });
  });

  describe("Project", () => {
    it("requires name and userId", async () => {
      const project = new Project({});
      let error: any;
      try {
        await project.validate();
      } catch (e) {
        error = e;
      }
      expect(error.errors.name).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });
  });

  describe("BoardColumn", () => {
    it("requires name, projectId", async () => {
      const column = new BoardColumn({});
      let error: any;
      try {
        await column.validate();
      } catch (e) {
        error = e;
      }
      expect(error.errors.name).toBeDefined();
      expect(error.errors.projectId).toBeDefined();
    });

    it("creates column with default position 0", async () => {
      const column = new BoardColumn({
        name: "Backlog",
        projectId: new mongoose.Types.ObjectId(),
      });
      await column.validate();
      expect(column.position).toBe(0);
      expect(column.name).toBe("Backlog");
    });
  });

  describe("Card", () => {
    it("requires title, columnId", async () => {
      const card = new Card({});
      let error: any;
      try {
        await card.validate();
      } catch (e) {
        error = e;
      }
      expect(error.errors.title).toBeDefined();
      expect(error.errors.columnId).toBeDefined();
    });

    it("creates card with default details empty string", async () => {
      const card = new Card({
        title: "Test card",
        columnId: new mongoose.Types.ObjectId(),
        position: 0,
      });
      await card.validate();
      expect(card.title).toBe("Test card");
      expect(card.details).toBe("");
      expect(card.position).toBe(0);
    });
  });
});
