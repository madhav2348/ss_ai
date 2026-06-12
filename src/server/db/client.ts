import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { env } from "../config/env";

const dbPath = env.sqliteStoragePath;

// Ensure target directory exists on startup
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(dbPath);
export type { Database };
