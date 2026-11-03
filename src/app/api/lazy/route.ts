import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_REGION, REGION_COOKIE } from "@/lib/weather";
import { FEED_TABS, NEWSSTAND_TABS, feedBlock, lazyData, newsstandBlock } from "@/lib/main";

/**
 * 네이버 `/nvhaproxy/v2/pc/lazy` 재해석.
 * - 파라미터 없음: 지연 블록 묶음(날씨/증시/캘린더/사전/오디오/장바구니/메모/서비스메타)
 * - ?blockCodeList=PC-MEDIA-WRAPPER&target=PC-MEDIA-NEWSSTAND-<탭>&page=n : 뉴스스탠드 탭/페이지
 * - ?blockCodeList=PC-FEED-WRAPPER&target=PC-FEED-<탭> : 관심사 피드 탭
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const list = url.searchParams.get("blockCodeList");
  const target = url.searchParams.get("target") ?? "";
  const user = await getCurrentUser();
  const headers = { "Cache-Control": "no-store" };

  if (list === "PC-MEDIA-WRAPPER") {
    const tab = target.replace("PC-MEDIA-NEWSSTAND-", "");
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
    const t = (NEWSSTAND_TABS as readonly string[]).includes(tab) ? tab : "뉴스스탠드";
    return NextResponse.json({ "PC-MEDIA-WRAPPER": { "@code": "PC-MEDIA-WRAPPER", blocks: [newsstandBlock(t, page)] } }, { headers });
  }
  if (list === "PC-FEED-WRAPPER") {
    const tab = target.replace("PC-FEED-", "");
    const t = (FEED_TABS as readonly string[]).includes(tab) ? tab : "추천";
    return NextResponse.json({ "PC-FEED-WRAPPER": { "@code": "PC-FEED-WRAPPER", blocks: [feedBlock(t)] } }, { headers });
  }
  const region = (await cookies()).get(REGION_COOKIE)?.value || DEFAULT_REGION;
  return NextResponse.json(lazyData(user?.id ?? null, region), { headers });
}
