import { NextResponse } from "next/server";
import { all, getDb } from "@/lib/db";
import { runSeeds } from "@/lib/seed";

/**
 * 개발용: 모든 테이블을 비우고 시드를 다시 넣는다.
 * 파일을 지우지 않고 같은 핸들에서 TRUNCATE 하므로 다른 서버 모듈이 들고 있는 핸들과 어긋나지 않는다.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ ok: false }, { status: 404 });
  const db = getDb();
  const tables = all<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
  db.exec("PRAGMA foreign_keys = OFF; BEGIN;");
  try {
    for (const t of tables) db.exec(`DELETE FROM "${t.name}"`);
    db.exec("DELETE FROM sqlite_sequence");
    db.exec("COMMIT;");
  } catch (e) {
    db.exec("ROLLBACK;");
    db.exec("PRAGMA foreign_keys = ON;");
    throw e;
  }
  db.exec("PRAGMA foreign_keys = ON;");
  runSeeds(db);
  return NextResponse.json({ ok: true, reseeded: true, tables: tables.length });
}
