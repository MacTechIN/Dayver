import { NextResponse } from "next/server";
import { listPress } from "@/lib/news";

/** GET /api/news/press?category=종합/경제&major=1&limit=20 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const category = u.searchParams.get("category") ?? undefined;
  const major = u.searchParams.get("major") === "1";
  const limit = Math.min(100, Math.max(1, Number(u.searchParams.get("limit") ?? 50) || 50));
  return NextResponse.json({ press: listPress({ category, major, limit }) });
}
