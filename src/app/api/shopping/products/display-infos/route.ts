import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { displayInfos } from "@/lib/shopping";

/** POST {pickTypes:[], exposureScreenPathType:"HOME_TAB", products:[{channelProductId}]} → {<id>:{tags,myDiscountPrice,points,wished}} */
export async function POST(req: Request) {
  let body: { products?: Array<{ channelProductId?: number; id?: number }> } = {};
  try { body = await req.json(); } catch {}
  const ids = (body.products ?? []).map((p) => Number(p.channelProductId ?? p.id)).filter((n) => Number.isInteger(n) && n > 0).slice(0, 100);
  const user = await getCurrentUser();
  return NextResponse.json(displayInfos(ids, user?.id));
}
