import "server-only";
import { cookies } from "next/headers";

/**
 * 보기 설정 (네이버 /nvhaproxy/v1/cookie/theme, /font 재해석).
 * 쿠키 dv_theme=light|dark, dv_font=small|normal|large. 로그인 시 user_settings에도 저장된다.
 */
export type Theme = "light" | "dark";
export type FontSize = "small" | "normal" | "large";
export const THEMES: Theme[] = ["light", "dark"];
export const FONT_SIZES: FontSize[] = ["small", "normal", "large"];
export const THEME_COOKIE = "dv_theme";
export const FONT_COOKIE = "dv_font";

export async function readViewSettings(): Promise<{ theme: Theme; font: FontSize }> {
  const jar = await cookies();
  const t = jar.get(THEME_COOKIE)?.value;
  const f = jar.get(FONT_COOKIE)?.value;
  return {
    theme: THEMES.includes(t as Theme) ? (t as Theme) : "light",
    font: FONT_SIZES.includes(f as FontSize) ? (f as FontSize) : "normal",
  };
}

export const COOKIE_OPTS = { path: "/", sameSite: "lax" as const, maxAge: 365 * 86_400 };
