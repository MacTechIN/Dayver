import { NextResponse } from "next/server";
import { DEFAULT_REGION, compactForecast } from "@/lib/weather";

/** GET /api/weather/now?region=<code> → 메인 위젯과 같은 축약 형태 */
export async function GET(request: Request) {
  const region = new URL(request.url).searchParams.get("region") ?? DEFAULT_REGION;
  const data = compactForecast(region);
  if (!data) return NextResponse.json({ error: "unknown_region" }, { status: 404 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
