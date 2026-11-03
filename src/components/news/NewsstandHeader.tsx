import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ServiceMenu } from "@/components/common/ServiceMenu";
import { PRESS_CATEGORIES } from "@/lib/news";

/** 뉴스스탠드 상단 (NEWSSTAND 로고 + MY뉴스/전체언론사 토글 + 새로고침/설정/DAYVER) */
export async function NewsstandHeader({ mode, category }: { mode: "my" | "all"; category: string }) {
  const user = await getCurrentUser();
  return (
    <header role="banner" className="bg-[#f3efe6] border-b border-[#d9d2c3]">
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <div className="dv-container flex items-center h-12 gap-4">
        <Link href="/newsstand" className="flex items-baseline gap-2" data-clk="newsstand.logo">
          <h1 className="text-[20px] font-black tracking-tight"><span className="text-dv-text">NEWS</span><span className="text-dv-text-3">STAND</span></h1>
          <span className="text-[12px] text-dv-text-2">뉴스스탠드 기사는 각 언론사에서 직접 편집합니다</span>
        </Link>
        <div className="mx-auto flex" role="tablist" aria-label="뉴스스탠드 모드">
          <Link role="tab" aria-selected={mode === "my"} href="/newsstand?mode=my" className={`px-5 py-1.5 text-[13px] font-bold border ${mode === "my" ? "bg-[#2b2b2b] text-white border-[#2b2b2b]" : "bg-white border-dv-border"}`}>MY뉴스</Link>
          <Link role="tab" aria-selected={mode === "all"} href="/newsstand" className={`px-5 py-1.5 text-[13px] font-bold border -ml-px ${mode === "all" ? "bg-[#2b2b2b] text-white border-[#2b2b2b]" : "bg-white border-dv-border"}`}>전체언론사</Link>
        </div>
        <nav aria-label="뉴스스탠드 도구" className="flex items-center gap-3 text-[13px]">
          {user ? <Link href="/me" className="font-bold">{user.nickname}</Link> : <Link href="/login?next=/newsstand" className="px-2 py-0.5 border border-dv-border bg-white rounded text-[12px]">로그인</Link>}
          <ServiceMenu />
          <Link href="/newsstand" data-clk="newsstand.refresh">↻ 새로고침</Link>
          <Link href="/news/my" data-clk="newsstand.setting">⚙ 설정</Link>
          <Link href="/" className="font-black text-dv-green">DAYVER</Link>
        </nav>
      </div>
      <nav aria-label="주제별 보기" className="bg-white/60 border-t border-[#e6e0d2]">
        <h2 className="sr-only">주제별 보기</h2>
        <ul className="dv-container flex justify-center gap-1 h-10 items-center text-[13px]">
          {PRESS_CATEGORIES.map((c) => (
            <li key={c}>
              <Link href={`/newsstand?category=${encodeURIComponent(c)}${mode === "my" ? "&mode=my" : ""}`} aria-current={c === category ? "page" : undefined} className={`px-3 py-1 rounded ${c === category ? "bg-white border border-dv-border font-bold" : "hover:underline"}`} data-clk="newsstand.category">{c}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
