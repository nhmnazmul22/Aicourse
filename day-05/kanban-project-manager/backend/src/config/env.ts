import { config } from "dotenv";

config();

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  DB_URL: process.env.DB_URL || "",
  DB_NAME: process.env.DB_NAME || "project-manager",
  JWT_SECRET: process.env.JWT_SECRET || "change-me",
  NODE_ENV: process.env.NODE_ENV || "development",
};

if (!env.DB_URL) {
  throw new Error("DB_URL is required");
}

if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}
