import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app";

describe("Express App Integration", () => {
  const app = createApp();

  it("GET /api/hello returns 200 with hello world", async () => {
    const res = await request(app).get("/api/hello");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "hello world" });
  });

  it("GET /api/projects returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });

  it("GET /api/nonexistent returns 404", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Not found");
  });
});
