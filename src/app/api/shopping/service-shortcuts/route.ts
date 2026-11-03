import { NextResponse } from "next/server";
import { listShortcuts } from "@/lib/shopping";

/** 관측된 /v3/web/v2/service-shortcuts 의 3그룹 구조 재해석 */
export async function GET() {
  const all = listShortcuts().map((s) => ({ id: String(s.id), type: "SERVICE_SHORTCUTS", name: s.title, landingUrl: s.landing_url, color: s.color, nudgeMessage: s.subtitle || null, nudgeOrder: s.sort }));
  return NextResponse.json({
    primaryVerticalShortcuts: all.slice(0, 6),
    marketingShortcuts: all.slice(6, 9),
    verticalShortcuts: all.slice(9),
  });
}
