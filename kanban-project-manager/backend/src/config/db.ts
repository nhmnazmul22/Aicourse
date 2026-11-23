import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(env.DB_URL, {
    dbName: env.DB_NAME,
  });
  isConnected = true;
}

export function getConnection() {
  return mongoose.connection;
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
