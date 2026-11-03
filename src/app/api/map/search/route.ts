import { NextResponse } from "next/server";
import { MAP_CATEGORIES, listPlaces } from "@/lib/map";

/** GET /api/map/search?query=&category= → { query, category, places[] } */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const query = (sp.get("query") ?? "").trim();
  const cat = sp.get("category") ?? "";
  const category = (MAP_CATEGORIES as readonly string[]).includes(cat) ? cat : undefined;
  const places = listPlaces({ query: query || undefined, category, limit: 60 });
  return NextResponse.json({ query, category: category ?? null, places }, { headers: { "Cache-Control": "no-store" } });
}
