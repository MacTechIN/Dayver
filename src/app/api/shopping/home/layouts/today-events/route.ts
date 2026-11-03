import { NextResponse } from "next/server";
import { listTodayEvents } from "@/lib/shopping";

/** 관측된 vertical-api /home/layouts/today-events 응답 형태 재해석 */
export async function GET() {
  const events = listTodayEvents();
  return NextResponse.json({
    titleInfo: { title: "오늘의 행사 놓치지 마세요!", highlights: ["오늘의 행사"] },
    demoType: "NOT_LOGIN",
    events: events.map((e) => ({
      serviceEditorContentId: String(e.id), imageColor: e.product?.image_color ?? e.color, titleText: e.title, headerText: e.header, labelText: e.label,
      landingUrl: e.landing_url, nlog: { contentsType: "prom", shpChannelProductId: e.product_id },
    })),
  });
}
