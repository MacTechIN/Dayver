import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";
import { Footer } from "@/components/common/Footer";
import { FOLDERS, folderCounts, type MailFolder } from "@/lib/mail";
import type { User } from "@/lib/auth";

/**
 * 메일 공통 레이아웃: 상단 바 + 좌측 폴더 열(메일쓰기/내게쓰기, 폴더 목록, 용량) + 본문.
 */
export function MailShell({ user, current, children }: { user: User; current: MailFolder | "write" | "read"; children: React.ReactNode }) {
  const counts = folderCounts(user.id);
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="메일" serviceHref="/mail" serviceColor="#03c75a">
        <form role="search" action="/mail/search" className="ml-6 flex items-center h-9 w-[320px] border border-dv-border rounded-full bg-white overflow-hidden">
          <input name="query" placeholder="메일 검색" aria-label="메일 검색" className="flex-1 h-full px-4 text-[13px] outline-none" />
          <button type="submit" aria-label="검색" className="w-9 h-full grid place-items-center text-dv-text-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
        </form>
      </TopBar>
      <div className="dv-container flex gap-6 pt-5 min-h-[720px]">
        <aside className="w-[200px] shrink-0" aria-label="메일함">
          <Link href="/mail/write" data-clk="mail.lnb.write" className="dv-btn-green block text-center py-3 text-[15px]">메일쓰기</Link>
          <Link href={`/mail/write?to=${user.username}@dayver.com`} className="block text-center py-2.5 mt-2 border border-dv-border rounded text-[13px] text-dv-text-2 bg-white">내게쓰기</Link>
          <nav aria-label="폴더">
            <ul className="mt-5 text-[14px]">
              {FOLDERS.map((f) => {
                const active = f.key === current;
                const n = counts[f.key];
                return (
                  <li key={f.key}>
                    <Link
                      href={f.href}
                      aria-current={active ? "page" : undefined}
                      data-clk={`mail.lnb.${f.key}`}
                      className={`flex items-center justify-between px-3 py-2 rounded ${active ? "bg-dv-bg-2 font-bold text-dv-text" : "text-dv-text-2 hover:bg-dv-bg-3"}`}
                    >
                      <span>{f.name}</span>
                      {n > 0 && <span className={`text-[12px] ${f.key === "inbox" ? "text-dv-green font-bold" : "text-dv-text-3"}`}>{n}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <section aria-label="메일 용량" className="mt-8 px-3 text-[12px] text-dv-text-3">
            <div className="h-1.5 bg-dv-bg-2 rounded overflow-hidden"><div className="h-full bg-dv-green" style={{ width: `${Math.min(100, (counts.sent + counts.trash + 4) * 2)}%` }} /></div>
            <p className="mt-1.5">{user.email}</p>
          </section>
        </aside>
        <main id="content" className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer compact />
    </>
  );
}
