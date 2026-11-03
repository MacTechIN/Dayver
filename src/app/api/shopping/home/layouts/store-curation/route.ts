import { NextResponse } from "next/server";
import { getStoreCuration } from "@/lib/shopping";

/** GET /api/shopping/home/layouts/store-curation?seed=0 */
export async function GET(req: Request) {
  const seed = Number(new URL(req.url).searchParams.get("seed") ?? 0) || 0;
  const c = getStoreCuration(seed);
  return NextResponse.json({
    displayType: c.displayType, dataType: c.dataType, themeId: c.themeId, categoryName: c.categoryName,
    titleInfos: [{ title: c.title, highlights: [c.categoryName] }],
    stores: c.stores.map((s) => ({ channelNo: s.id, channelUid: s.slug, channelName: s.name, channelSiteFullUrl: `/shopping/store/${s.slug}`, description: s.description, channelProductIds: s.products.map((p) => p.id) })),
  });
}
