import Link from "next/link";
import { LoginBox } from "@/components/common/LoginBox";
import { all } from "@/lib/db";

/** 우측 컬럼: 로그인 박스, 공지사항, 프로모션 카드, 푸터 링크 */
export async function RightColumn({ next = "/cafe" }: { next?: string }) {
  const notices = all<{ id: number; title: string }>("SELECT id, title FROM notices ORDER BY created_at DESC LIMIT 4");
  return (
    <aside className="w-[300px] shrink-0 space-y-4">
      <LoginBox next={next} />
      <section aria-label="공지사항" className="dv-card p-5">
        <h2 className="font-bold text-[14px] mb-3 flex items-center justify-between">
          <Link href="/cafe/notice" data-clk="cafe_right.notice">공지사항 ›</Link>
        </h2>
        <ul className="space-y-2 text-[13px] text-dv-text-2">
          {notices.map((n) => (
            <li key={n.id} className="dv-ellipsis"><Link href="/cafe/notice">{n.title}</Link></li>
          ))}
          <li className="dv-ellipsis"><Link href="/cafe/notice">[안내] 카페 마켓 거래 시 안전거래 이용 안내</Link></li>
          <li className="dv-ellipsis"><Link href="/cafe/notice">[안내] 운영진 권한 체계 개편 안내</Link></li>
        </ul>
      </section>
      <section aria-label="카페 챗봇" className="rounded-xl bg-dv-bg-2 p-4 flex items-center gap-3 text-[14px]">
        <span className="w-9 h-9 rounded-full bg-dv-green text-white grid place-items-center" aria-hidden>☕</span>
        <span>카페의 모든 것을 도와드려요</span>
      </section>
      <section aria-label="프로모션" className="rounded-2xl overflow-hidden text-white" style={{ background: "linear-gradient(160deg, #0f172a, #5e3bee)" }}>
        <div className="p-6 h-[260px] flex flex-col justify-between">
          <div>
            <p className="text-[12px] opacity-80">DAYVER 스토어</p>
            <p className="text-[24px] font-black leading-tight mt-1">넓다세일<br />인기 상품을 한 눈에!</p>
          </div>
          <Link href="/shopping" className="self-start bg-white/15 rounded-full px-4 py-2 text-[13px] font-bold" data-clk="cafe_right.promo">바로가기 →</Link>
        </div>
      </section>
      <section aria-label="카페 마켓" className="rounded-xl bg-dv-bg-2 p-4 flex items-center gap-3 text-[13px]">
        <span className="w-9 h-9 rounded-lg bg-dv-purple text-white grid place-items-center" aria-hidden>▣</span>
        <span>지금 우리 동네 거래 중인 물건 보기<br /><Link href="/cafe/market" className="font-bold">마켓 바로가기</Link></span>
      </section>
      <section aria-label="고객센터" className="text-[13px]">
        <Link href="/me" className="flex items-center gap-2 py-3 border-b border-dv-border"><span aria-hidden>🔔</span>고객센터</Link>
        <ul className="flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-dv-text-3 pt-3">
          <li><Link href="/me">카페 이용약관</Link></li><li>·</li>
          <li><Link href="/me">마켓 이용약관</Link></li><li>·</li>
          <li><Link href="/me">개인정보처리방침</Link></li><li>·</li>
          <li><Link href="/me">카페 운영정책</Link></li>
        </ul>
        <p className="text-[12px] text-dv-text-3 mt-2">ⓓ DAYVER Corp.</p>
      </section>
    </aside>
  );
}
