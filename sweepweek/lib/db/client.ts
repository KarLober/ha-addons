import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

const databasePath = process.env.DATABASE_PATH ?? "./data/sweepweek.db";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

// Lazy: the connection must not open as a module-import side effect. Next's
// build collects page data using several parallel workers that all import
// this module; opening the (possibly not-yet-existing) SQLite file eagerly
// from each of them races and throws SQLITE_BUSY. Opening it lazily on
// first actual query means it only ever happens once, at real runtime.
let instance: DrizzleDb | null = null;

function getInstance(): DrizzleDb {
  if (!instance) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    const sqlite = new Database(databasePath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    instance = drizzle(sqlite, { schema });
  }
  return instance;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getInstance() as object, prop, receiver);
  },
});
