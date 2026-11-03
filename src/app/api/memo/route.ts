import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { run } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { content?: string };
  const content = String(body.content ?? "").slice(0, 2000);
  run("INSERT INTO memos (user_id, content, updated_at) VALUES (?, ?, datetime('now','localtime')) ON CONFLICT(user_id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at", user.id, content);
  return NextResponse.json({ ok: true });
}
