import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";
import { NEWS_SECTIONS } from "@/lib/news";

const SECTION_SLUG: Record<string, string> = {
  정치: "politics", 경제: "economy", 사회: "society", "생활/문화": "life", "IT/과학": "it", 세계: "world", 엔터: "entertain", 스포츠: "sports",
};
export const SLUG_SECTION: Record<string, string> = Object.fromEntries(Object.entries(SECTION_SLUG).map(([k, v]) => [v, k]));
export function sectionHref(section: string) {
  return `/news/section/${SECTION_SLUG[section] ?? encodeURIComponent(section)}`;
}

/**
 * 뉴스 헤더 (news.naver.com 재해석):
 * 진한 파랑 상단 바(로고 "D 뉴스" + 엔터/스포츠/날씨/프리미엄, 로그인/더보기/검색)
 * + 흰색 섹션 메뉴 바(언론사별·정치·…·팩트체크, 우측 MY).
 */
export async function NewsHeader({ active }: { active?: string }) {
  return (
    <header role="banner">
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <div className="bg-[#1e2a3a] text-white">
        <TopBar service="뉴스" serviceHref="/news" tone="dark">
          <nav aria-label="뉴스 패밀리 서비스" className="flex items-center gap-4 ml-3 text-[14px] text-white/85">
            <Link href="/news/section/entertain" data-clk="news_gnb.enter">엔터</Link>
            <Link href="/news/section/sports" data-clk="news_gnb.sports">스포츠</Link>
            <Link href="/" data-clk="news_gnb.weather">날씨</Link>
            <Link href="/news/ranking" data-clk="news_gnb.premium">프리미엄</Link>
            <form action="/search" className="ml-2 flex items-center" role="search">
              <input name="query" placeholder="뉴스 검색" aria-label="뉴스 검색" className="bg-white/10 placeholder-white/50 text-white text-[13px] px-3 py-1 rounded-l w-44 outline-none" />
              <button type="submit" className="bg-white/20 px-2 py-1 rounded-r text-[13px]" aria-label="검색">🔍</button>
            </form>
          </nav>
        </TopBar>
      </div>
      <div className="bg-white border-b border-dv-border">
        <nav aria-label="뉴스 섹션" className="dv-container flex items-center h-12">
          <ul role="menubar" className="flex items-center gap-6 text-[15px] font-bold">
            <li role="none"><Link role="menuitem" href="/news" className={`inline-block py-3 border-b-2 ${active === "home" ? "border-dv-blue text-dv-blue" : "border-transparent"}`} data-clk="news_lnb.press">언론사별</Link></li>
            {NEWS_SECTIONS.map((s) => (
              <li role="none" key={s}>
                <Link role="menuitem" href={sectionHref(s)} className={`inline-block py-3 border-b-2 ${active === s ? "border-dv-blue text-dv-blue" : "border-transparent"}`} data-clk={`news_lnb.${SECTION_SLUG[s]}`}>{s}</Link>
              </li>
            ))}
            <li role="none"><Link role="menuitem" href="/news/ranking" className={`inline-block py-3 border-b-2 ${active === "ranking" ? "border-dv-blue text-dv-blue" : "border-transparent"}`}>랭킹 <sup className="text-dv-red text-[9px]">●</sup></Link></li>
            <li role="none"><Link role="menuitem" href="/newsstand" className="inline-block py-3">신문보기</Link></li>
            <li role="none"><Link role="menuitem" href="/news/section/life" className="inline-block py-3">오피니언</Link></li>
            <li role="none"><Link role="menuitem" href="/news/section/entertain" className="inline-block py-3">TV</Link></li>
            <li role="none"><Link role="menuitem" href="/news/section/society" className="inline-block py-3">팩트체크</Link></li>
          </ul>
          <Link href="/news/my" className={`ml-auto flex items-center gap-1 text-[14px] font-bold ${active === "my" ? "text-dv-blue" : ""}`} data-clk="news_lnb.my">
            <span aria-hidden>👤</span> MY <span aria-hidden>›</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
