import { NextResponse } from "next/server";
import { listHeadlines, listRanking } from "@/lib/news";

/** GET /api/news/headlines?limit=10&sort=views */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(u.searchParams.get("limit") ?? 10) || 10));
  const sort = u.searchParams.get("sort");
  return NextResponse.json({ articles: sort === "views" ? listRanking(limit) : listHeadlines(limit) });
}
