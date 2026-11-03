import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { all, run } from "@/lib/db";
import { TopBar } from "@/components/common/TopBar";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = { title: "MY - DAYVER" };

type Noti = { id: number; service: string; message: string; link: string; read_at: string | null; created_at: string };

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/me");
  const notis = all<Noti>("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", user.id);
  run("UPDATE notifications SET read_at = datetime('now','localtime') WHERE user_id = ? AND read_at IS NULL", user.id);
  const stats = {
    blog: all<{ c: number }>("SELECT COUNT(*) c FROM blog_posts WHERE user_id = ?", user.id)[0]?.c ?? 0,
    cafe: all<{ c: number }>("SELECT COUNT(*) c FROM cafe_members WHERE user_id = ?", user.id)[0]?.c ?? 0,
    mail: all<{ c: number }>("SELECT COUNT(*) c FROM mails WHERE to_user_id = ? AND deleted_by_receiver = 0", user.id)[0]?.c ?? 0,
    orders: all<{ c: number }>("SELECT COUNT(*) c FROM shop_orders WHERE user_id = ?", user.id)[0]?.c ?? 0,
  };
  return (
    <>
      <TopBar service="MY" serviceHref="/me" />
      <main className="dv-container py-8 grid grid-cols-[300px_1fr] gap-6">
        <aside className="dv-card p-6">
          <span className="block w-20 h-20 rounded-full mx-auto grid place-items-center text-white text-3xl font-black" style={{ background: user.avatar_color }} aria-hidden>{user.nickname.slice(0, 1)}</span>
          <h1 className="text-center font-bold text-[18px] mt-3">{user.nickname}</h1>
          <p className="text-center text-[13px] text-dv-text-3">{user.email}</p>
          <p className="text-center text-[13px] text-dv-text-2 mt-2">{user.bio || "소개가 없습니다."}</p>
          <p className="text-center text-[12px] text-dv-text-3 mt-3">가입일 {user.created_at.slice(0, 10)}</p>
          <ul className="mt-5 pt-4 border-t border-dv-border-2 text-[14px] space-y-1">
            <li><Link href="/me/notifications" className="block px-3 py-2 rounded hover:bg-dv-bg-2">알림 센터</Link></li>
            <li><Link href="/me/settings" className="block px-3 py-2 rounded hover:bg-dv-bg-2">설정 (프로필·비밀번호·보기 설정)</Link></li>
          </ul>
        </aside>
        <section>
          <h2 className="font-bold text-[16px] mb-3">내 서비스</h2>
          <ul className="grid grid-cols-4 gap-3">
            {[
              { n: "블로그 글", v: stats.blog, href: "/blog/my", c: "#1ec800" },
              { n: "가입 카페", v: stats.cafe, href: "/cafe/my", c: "#2db400" },
              { n: "받은 메일", v: stats.mail, href: "/mail", c: "#03c75a" },
              { n: "주문", v: stats.orders, href: "/shopping/orders", c: "#5e3bee" },
            ].map((s) => (
              <li key={s.n}>
                <Link href={s.href} className="dv-card block p-4 hover:shadow">
                  <b className="block text-[22px]" style={{ color: s.c }}>{s.v}</b>
                  <span className="text-[13px] text-dv-text-2">{s.n}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="font-bold text-[16px] mt-8 mb-3">알림</h2>
          <ul className="dv-card divide-y divide-dv-border-2">
            {notis.length === 0 && <li className="p-6 text-center text-dv-text-3">새 알림이 없습니다.</li>}
            {notis.map((n) => (
              <li key={n.id} className={`p-4 flex items-center gap-3 ${n.read_at ? "" : "bg-dv-bg-3"}`}>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-dv-bg-2 text-dv-text-2 uppercase">{n.service}</span>
                <Link href={n.link || "#"} className="flex-1">{n.message}</Link>
                <time className="text-[12px] text-dv-text-3">{n.created_at.slice(5, 16)}</time>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer compact />
    </>
  );
}
