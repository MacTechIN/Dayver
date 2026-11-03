import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_REGION, REGION_COOKIE, getRegion } from "@/lib/weather";

export const metadata: Metadata = { title: "DAYVER 날씨" };

/** 기본 지역: dv_region 쿠키 → 없으면 서울 중구 */
export default async function WeatherHome() {
  const jar = await cookies();
  const code = jar.get(REGION_COOKIE)?.value;
  redirect(`/weather/${code && getRegion(code) ? code : DEFAULT_REGION}`);
}
