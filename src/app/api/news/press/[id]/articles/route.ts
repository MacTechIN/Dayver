import { NextResponse } from "next/server";
import { getPressArticles, getPressById } from "@/lib/news";

/** GET /api/news/press/:id/articles?limit=6 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const pid = Number(id);
  const press = Number.isInteger(pid) ? getPressById(pid) : undefined;
  if (!press) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const limit = Math.min(50, Math.max(1, Number(new URL(req.url).searchParams.get("limit") ?? 6) || 6));
  return NextResponse.json({ press, articles: getPressArticles(pid, limit) });
}
