import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { DayverLogo } from "./DayverLogo";
import { logoutAction } from "@/lib/actions/auth";
import { ServiceMenu } from "./ServiceMenu";

/**
 * 서비스 공통 상단 바 (네이버 GNB `gnb_utf8` 재해석):
 * 좌측 Dayver 로고 + 서비스명, 우측 로그인 / 사용자 메뉴 / 서비스 더보기.
 */
export async function TopBar({
  service,
  serviceHref,
  serviceColor,
  children,
  tone = "light",
}: {
  service?: string;
  serviceHref?: string;
  serviceColor?: string;
  children?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const user = await getCurrentUser();
  const dark = tone === "dark";
  const unread = user ? get<{ c: number }>("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND read_at IS NULL", user.id)?.c ?? 0 : 0;
  return (
    <div className={dark ? "bg-[#1e2a3a] text-white" : "bg-white border-b border-dv-border"}>
      <div className="dv-container flex items-center justify-between h-12">
        <div className="flex items-center gap-3">
          <DayverLogo size={24} serviceColor={dark ? "#fff" : undefined} />
          {service && (
            <>
              <span className={dark ? "text-white/30" : "text-dv-border"} aria-hidden>|</span>
              <Link href={serviceHref ?? "#"} className="font-bold text-[15px]" style={{ color: dark ? "#fff" : serviceColor ?? "var(--dv-text)" }}>
                {service}
              </Link>
            </>
          )}
          {children}
        </div>
        <ul className="flex items-center gap-2 text-[13px]">
          {user ? (
            <>
              <li>
                <Link href="/mail" className={`px-2 py-1 rounded ${dark ? "hover:bg-white/10" : "hover:bg-dv-bg-2"}`}>메일</Link>
              </li>
              <li>
                <Link href="/me/notifications" aria-label={`알림 ${unread}건`} className={`px-2 py-1 rounded flex items-center gap-1 ${dark ? "hover:bg-white/10" : "hover:bg-dv-bg-2"}`}>
                  알림{unread > 0 && <span className="min-w-4 h-4 px-1 rounded-full bg-dv-red text-white text-[10px] grid place-items-center">{unread}</span>}
                </Link>
              </li>
              <li>
                <Link href="/me" className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-black/5">
                  <span className="inline-block w-5 h-5 rounded-full" style={{ background: user.avatar_color }} aria-hidden />
                  <b>{user.nickname}</b>
                </Link>
              </li>
              <li>
                <form action={logoutAction}>
                  <button type="submit" className={`px-2 py-0.5 rounded border text-[12px] ${dark ? "border-white/30" : "border-dv-border"}`}>로그아웃</button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className={`px-3 py-1 rounded border font-bold ${dark ? "border-white/40" : "border-dv-border"}`}>로그인</Link>
            </li>
          )}
          <li>
            <ServiceMenu dark={dark} />
          </li>
        </ul>
      </div>
    </div>
  );
}
