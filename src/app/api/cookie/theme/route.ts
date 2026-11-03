import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { COOKIE_OPTS, THEME_COOKIE, THEMES, type Theme } from "@/lib/settings";

/** 네이버 `/nvhaproxy/v1/cookie/theme` 재해석: 테마 쿠키 저장 (+로그인 시 DB 저장) */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { theme?: string };
  const theme = body.theme as Theme;
  if (!THEMES.includes(theme)) return NextResponse.json({ ok: false, error: "invalid theme" }, { status: 400 });
  (await cookies()).set(THEME_COOKIE, theme, COOKIE_OPTS);
  const user = await getCurrentUser();
  if (user) run("INSERT INTO user_settings (user_id, theme) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET theme = excluded.theme", user.id, theme);
  return NextResponse.json({ ok: true, theme });
}
