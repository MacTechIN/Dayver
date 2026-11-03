import { NextResponse } from "next/server";
import { listByCodes, listStocks } from "@/lib/stock";

/** GET /api/stock/items?codes=005930,000660  (codes 없으면 인기 검색 상위 10) */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("codes");
  const codes = raw ? raw.split(",").map((c) => c.trim()).filter(Boolean).slice(0, 50) : [];
  const items = codes.length ? listByCodes(codes) : listStocks({ orderBy: "search_rank", limit: 10 });
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
