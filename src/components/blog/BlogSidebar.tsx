import Link from "next/link";
import { LoginBox } from "@/components/common/LoginBox";
import { all } from "@/lib/db";

const PROMOS = [
  { small: "온라인 셀러를 위한", big: "블로그 마켓 가입", href: "/shopping", icon: "b" },
  { small: "정직한 리뷰를 위한", big: "협찬 · 광고글 가이드", href: "/blog/dayver", icon: "≡" },
  { small: "누구보다 발빠르게", big: "블로그 새소식", href: "/blog/dayver", icon: "✉" },
];

/** 우측 사이드바: 로그인 박스, 홍보 3줄, 공지사항 */
export async function BlogSidebar({ next = "/blog" }: { next?: string }) {
  const notices = all<{ id: number; title: string }>("SELECT id, title FROM notices ORDER BY created_at DESC LIMIT 3");
  return (
    <aside className="w-[280px] shrink-0 space-y-4">
      <LoginBox next={next} />
      <ul className="dv-card divide-y divide-dv-border-2">
        {PROMOS.map((p) => (
          <li key={p.big}>
            <Link href={p.href} className="flex items-center justify-between p-5 hover:bg-dv-bg-3">
              <span>
                <span className="block text-[13px] text-dv-text-2">{p.small}</span>
                <b className="block text-[16px]">{p.big}</b>
              </span>
              <span className="w-10 h-10 rounded-lg border border-dv-border grid place-items-center text-dv-green font-black" aria-hidden>{p.icon}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-label="공지사항" className="dv-card p-5">
        <h2 className="font-bold text-[14px] flex items-center justify-between">공지사항 <Link href="/blog/dayver" className="text-dv-text-3 font-normal text-[12px]">더보기 ›</Link></h2>
        <ul className="mt-3 space-y-1.5 text-[13px] text-dv-text-2">
          {notices.map((n) => (
            <li key={n.id} className="dv-ellipsis"><Link href="/blog/dayver">{n.title}</Link></li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
