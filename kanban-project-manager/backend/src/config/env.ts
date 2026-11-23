import { config } from "dotenv";
import path from "path";

// Load from current directory, or fallback to project root .env
config();
if (!process.env.DB_URL) {
  config({ path: path.resolve(__dirname, "../../../.env") });
}

const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  DB_URL: process.env.DB_URL || (isTest ? "mongodb://localhost:27017/test" : ""),
  DB_NAME: process.env.DB_NAME || "project-manager",
  JWT_SECRET: process.env.JWT_SECRET || (isTest ? "test-jwt-secret-min-32-characters-long" : "change-me"),
  OPEN_ROUTER_KEY: process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_KEY || "",
  NODE_ENV: process.env.NODE_ENV || (isTest ? "test" : "development"),
};

if (!env.DB_URL && !isTest) {
  throw new Error("DB_URL is required");
}

if ((!env.JWT_SECRET || env.JWT_SECRET.length < 32) && !isTest) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}
