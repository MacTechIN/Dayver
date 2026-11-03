import { NextResponse } from "next/server";
import { searchCafePosts, searchCafes } from "@/lib/cafe";

/** GET /api/cafe/search?q=&limit= — 카페와 글 검색 (자동완성/통합검색용) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 10));
  if (!q) return NextResponse.json({ q, cafes: [], posts: [] });
  const cafes = searchCafes(q, limit).map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description, category: c.category, color: c.color, member_count: c.member_count }));
  const posts = searchCafePosts(q, limit).map((p) => ({ id: p.id, cafe_slug: p.cafe_slug, cafe_name: p.cafe_name, title: p.title, author: p.author, likes: p.likes, comment_count: p.comment_count, created_at: p.created_at }));
  return NextResponse.json({ q, cafes, posts });
}
