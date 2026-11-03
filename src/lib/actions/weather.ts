"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { REGION_COOKIE, getRegion } from "@/lib/weather";

/** 지역 설정: 선택한 지역 코드를 쿠키에 저장하고 해당 지역 페이지로 이동 */
export async function setRegionAction(form: FormData) {
  const code = String(form.get("code") ?? "");
  if (!getRegion(code)) redirect("/weather");
  const jar = await cookies();
  jar.set(REGION_COOKIE, code, { path: "/", sameSite: "lax", maxAge: 180 * 86_400 });
  redirect(`/weather/${code}`);
}
