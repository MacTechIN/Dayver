import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { COOKIE_OPTS, FONT_COOKIE, FONT_SIZES, type FontSize } from "@/lib/settings";

/** 네이버 `/nvhaproxy/v1/cookie/font` 재해석: 글꼴 크기 쿠키 저장 (+로그인 시 DB 저장) */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { font?: string };
  const font = body.font as FontSize;
  if (!FONT_SIZES.includes(font)) return NextResponse.json({ ok: false, error: "invalid font" }, { status: 400 });
  (await cookies()).set(FONT_COOKIE, font, COOKIE_OPTS);
  const user = await getCurrentUser();
  if (user) run("INSERT INTO user_settings (user_id, font_size) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET font_size = excluded.font_size", user.id, font);
  return NextResponse.json({ ok: true, font });
}
