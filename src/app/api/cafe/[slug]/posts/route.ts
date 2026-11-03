import { NextResponse } from "next/server";
import { getCafeBySlug, listCafePosts } from "@/lib/cafe";

/** GET /api/cafe/[slug]/posts?board=&page=&size= — 카페 글 목록 JSON */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const cafe = getCafeBySlug(slug);
  if (!cafe) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const url = new URL(req.url);
  const boardId = Number(url.searchParams.get("board")) || undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const size = Math.min(50, Math.max(1, Number(url.searchParams.get("size")) || 20));
  const { posts, total } = listCafePosts(cafe.id, { boardId, page, size });
  return NextResponse.json({
    cafe: { id: cafe.id, slug: cafe.slug, name: cafe.name },
    page, size, total,
    posts: posts.map((p) => ({ id: p.id, board_id: p.board_id, board_name: p.board_name, title: p.title, author: p.author, views: p.views, likes: p.likes, comment_count: p.comment_count, is_notice: p.is_notice, created_at: p.created_at })),
  });
}
