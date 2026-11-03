import { NextResponse } from "next/server";
import { all } from "@/lib/db";

export async function GET() {
  const tables = all<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name");
  const counts: Record<string, number> = {};
  for (const t of tables) counts[t.name] = (all<{ c: number }>(`SELECT COUNT(*) c FROM ${t.name}`)[0]?.c) ?? 0;
  return NextResponse.json({ ok: true, counts });
}
