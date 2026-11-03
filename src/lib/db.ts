import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { ALL_SCHEMA } from "./schema";
import { runSeeds } from "./seed";

export type Row = Record<string, unknown>;

declare global {
  var __dayverDb: DatabaseSync | undefined;
}

function open(): DatabaseSync {
  const dir = path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "dayver.db"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");
  db.exec(ALL_SCHEMA);
  runSeeds(db);
  return db;
}

/** 프로세스 전역 SQLite 핸들 (dev HMR에서도 한 번만 연다). */
export function getDb(): DatabaseSync {
  if (!globalThis.__dayverDb) globalThis.__dayverDb = open();
  return globalThis.__dayverDb;
}

/** SELECT 여러 행 */
export function all<T = Row>(sql: string, ...params: Array<string | number | null>): T[] {
  // node:sqlite는 null-prototype 객체를 돌려주므로 RSC 직렬화를 위해 평범한 객체로 복사한다.
  return (getDb().prepare(sql).all(...params) as Row[]).map((r) => ({ ...r })) as T[];
}
/** SELECT 한 행 */
export function get<T = Row>(sql: string, ...params: Array<string | number | null>): T | undefined {
  const r = getDb().prepare(sql).get(...params) as Row | undefined;
  return r ? ({ ...r } as T) : undefined;
}
/** INSERT/UPDATE/DELETE */
export function run(sql: string, ...params: Array<string | number | null>) {
  const r = getDb().prepare(sql).run(...params);
  return { lastId: Number(r.lastInsertRowid), changes: Number(r.changes) };
}
/** 트랜잭션 */
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const v = fn();
    db.exec("COMMIT");
    return v;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
