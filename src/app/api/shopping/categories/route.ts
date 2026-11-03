import { NextResponse } from "next/server";
import { getCategoryTree } from "@/lib/shopping";

/** GET /api/shopping/categories → {categories:[{id,name,type,children[],exposedVerticals[]}]} (gnb/category/list 재해석) */
export async function GET() {
  const tree = getCategoryTree().map((t) => ({
    id: t.id, name: t.name, type: t.name === "렌탈관" ? "ETC" : "DEFAULT", vertical_code: t.vertical_code,
    children: t.children.map((c) => ({ id: c.id, name: c.name })),
    exposedVerticals: t.vertical_code ? [{ code: t.vertical_code, pcLandingUrl: `/shopping/category/${t.id}` }] : [],
  }));
  return NextResponse.json({ categories: tree, banners: [] });
}
