import { NextResponse } from "next/server";
import { all } from "@/lib/db";

/**
 * 통합검색 자동완성 (네이버 ac.search.naver.com/nx/ac 재해석).
 * 응답: { query, items: [[키워드, 출처]] }
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ query: q, items: [] });
  const like = `%${q}%`;
  const items: Array<[string, string]> = [];
  const seen = new Set<string>();
  const push = (k: string, src: string) => {
    const key = k.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    items.push([key, src]);
  };
  for (const r of all<{ name: string }>("SELECT name FROM shop_categories WHERE name LIKE ? LIMIT 3", like)) push(r.name, "쇼핑");
  for (const r of all<{ name: string }>("SELECT name FROM shop_products WHERE name LIKE ? ORDER BY review_count DESC LIMIT 3", like)) push(r.name, "쇼핑");
  for (const r of all<{ name: string }>("SELECT name FROM cafes WHERE name LIKE ? LIMIT 3", like)) push(r.name, "카페");
  for (const r of all<{ title: string }>("SELECT title FROM news_articles WHERE title LIKE ? ORDER BY created_at DESC LIMIT 3", like)) push(r.title, "뉴스");
  for (const r of all<{ title: string }>("SELECT title FROM blog_posts WHERE title LIKE ? ORDER BY created_at DESC LIMIT 3", like)) push(r.title, "블로그");
  for (const r of all<{ name: string }>("SELECT name FROM news_press WHERE name LIKE ? LIMIT 2", like)) push(r.name, "언론사");
  return NextResponse.json({ query: q, items: items.slice(0, 10) }, { headers: { "Cache-Control": "no-store" } });
}
