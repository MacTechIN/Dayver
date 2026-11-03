import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { TopBar } from "@/components/common/TopBar";
import { Footer } from "@/components/common/Footer";
import { deleteNotificationAction, deleteReadNotificationsAction, markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/me";

export const metadata: Metadata = { title: "알림 센터 - DAYVER MY" };

type Noti = { id: number; service: string; message: string; link: string; read_at: string | null; created_at: string };
const SERVICES: Record<string, { name: string; color: string }> = {
  dayver: { name: "데이버", color: "#03c75a" }, mail: { name: "메일", color: "#03c75a" }, cafe: { name: "카페", color: "#2db400" },
  blog: { name: "블로그", color: "#1ec800" }, shopping: { name: "쇼핑", color: "#5e3bee" }, news: { name: "뉴스", color: "#0068c3" }, stock: { name: "증권", color: "#0068c3" },
};

/** 알림 센터 (네이버 상단 '알림' 레이어 재해석): 서비스 필터, 읽음 처리, 삭제 */
export default async function NotificationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/me/notifications");
  const sp = await searchParams;
  const filter = typeof sp.service === "string" ? sp.service : "all";
  const rows = filter === "all"
    ? all<Noti>("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 200", user.id)
    : all<Noti>("SELECT * FROM notifications WHERE user_id = ? AND service = ? ORDER BY created_at DESC LIMIT 200", user.id, filter);
  const unread = rows.filter((r) => !r.read_at).length;
  const services = all<{ service: string; c: number }>("SELECT service, COUNT(*) c FROM notifications WHERE user_id = ? GROUP BY service", user.id);
  return (
    <>
      <TopBar service="MY" serviceHref="/me" />
      <main id="content" className="dv-container py-8 grid grid-cols-[220px_1fr] gap-8">
        <nav aria-label="MY 메뉴" className="text-[14px]">
          <ul className="space-y-1">
            <li><Link href="/me" className="block px-3 py-2 rounded hover:bg-dv-bg-2">내 정보</Link></li>
            <li><Link href="/me/notifications" className="block px-3 py-2 rounded bg-dv-bg-2 font-bold">알림 센터</Link></li>
            <li><Link href="/me/settings" className="block px-3 py-2 rounded hover:bg-dv-bg-2">설정</Link></li>
          </ul>
        </nav>
        <div className="max-w-[820px]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[20px] font-bold">알림 <span className="text-dv-green text-[15px]">{unread > 0 ? `안 읽음 ${unread}` : ""}</span></h1>
            <div className="flex gap-2">
              <form action={markAllNotificationsReadAction}><button type="submit" className="px-3 py-1.5 border border-dv-border rounded text-[13px]">모두 읽음</button></form>
              <form action={deleteReadNotificationsAction}><button type="submit" className="px-3 py-1.5 border border-dv-border rounded text-[13px]">읽은 알림 삭제</button></form>
            </div>
          </div>
          <ul role="tablist" aria-label="서비스 필터" className="flex gap-2 mb-4 text-[13px]">
            <li><Link role="tab" aria-selected={filter === "all"} href="/me/notifications" className={`px-3 py-1 rounded-full ${filter === "all" ? "bg-dv-text text-white" : "bg-dv-bg-2"}`}>전체</Link></li>
            {services.map((s) => (
              <li key={s.service}><Link role="tab" aria-selected={filter === s.service} href={`/me/notifications?service=${s.service}`} className={`px-3 py-1 rounded-full ${filter === s.service ? "bg-dv-text text-white" : "bg-dv-bg-2"}`}>{SERVICES[s.service]?.name ?? s.service} {s.c}</Link></li>
            ))}
          </ul>
          <ul className="dv-card divide-y divide-dv-border-2">
            {rows.length === 0 && <li className="p-10 text-center text-dv-text-3">알림이 없습니다.</li>}
            {rows.map((n) => (
              <li key={n.id} className={`p-4 flex items-center gap-3 ${n.read_at ? "" : "bg-dv-bg-3"}`}>
                <span className="w-9 h-9 rounded-full grid place-items-center text-white text-[12px] font-black shrink-0" style={{ background: SERVICES[n.service]?.color ?? "#888" }} aria-hidden>{(SERVICES[n.service]?.name ?? n.service).slice(0, 1)}</span>
                <form action={markNotificationReadAction} className="flex-1 min-w-0">
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className={`text-left w-full dv-ellipsis ${n.read_at ? "text-dv-text-2" : "font-bold"}`}>{n.message}</button>
                  <span className="block text-[12px] text-dv-text-3">{SERVICES[n.service]?.name ?? n.service} · {n.created_at.slice(0, 16)}</span>
                </form>
                <form action={deleteNotificationAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" aria-label="알림 삭제" className="w-7 h-7 rounded-full text-dv-text-3 hover:bg-dv-bg-2">✕</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer compact />
    </>
  );
}
