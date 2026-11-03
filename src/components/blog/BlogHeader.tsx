import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { name: "블로그 홈", href: "/blog" },
  { name: "주제별 보기", href: "/blog/topic/전체" },
  { name: "이달의 블로그", href: "/blog/monthly" },
  { name: "공식블로그", href: "/blog/dayver" },
  { name: "챌린지 프로그램", href: "/blog/challenge" },
];

/**
 * 블로그 헤더: "D blog" 로고 + 검색 그룹(글 검색모드, 검색창, 블로그 검색, 통합검색) + 로그인/서비스 더보기,
 * 아래 줄은 블로그 홈/주제별 보기/이달의 블로그/공식블로그/챌린지 프로그램 내비게이션과 우측 버튼.
 */
export async function BlogHeader({ current = "/blog", query = "" }: { current?: string; query?: string }) {
  const user = await getCurrentUser();
  return (
    <header role="banner">
      <TopBar service="blog" serviceHref="/blog" serviceColor="#1ec800">
        <form role="search" action="/blog/search" className="ml-6 flex items-center h-9 w-[340px] border border-dv-border rounded-full overflow-hidden bg-white">
          <fieldset className="contents">
            <legend className="sr-only">검색창</legend>
            <select name="mode" aria-label="글 검색모드 펼치기" className="h-full pl-3 pr-1 text-[12px] text-dv-text-2 bg-transparent outline-none">
              <option value="post">글</option>
              <option value="blog">블로그</option>
            </select>
            <input
              name="query"
              defaultValue={query}
              placeholder="검색어를 입력하고 버튼을 누르세요."
              aria-label="검색어를 입력하고 버튼을 누르세요"
              className="flex-1 h-full px-2 text-[13px] outline-none"
            />
            <button type="submit" aria-label="블로그 검색" className="w-9 h-full grid place-items-center text-dv-text-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </button>
          </fieldset>
        </form>
        <Link href={query ? `/search?query=${encodeURIComponent(query)}` : "/search"} className="ml-2 h-9 px-3 border border-dv-border rounded-full text-[12px] text-dv-text-2 inline-flex items-center">
          통합검색
        </Link>
      </TopBar>
      <nav aria-label="블로그 메뉴" className="border-b border-dv-border bg-white">
        <div className="dv-container flex items-center h-12">
          <ul className="flex items-center gap-7 text-[15px]">
            {NAV.map((n) => {
              const active = current === n.href;
              return (
                <li key={n.href} className={n.href === "/blog/monthly" ? "pl-7 border-l border-dv-border" : ""}>
                  <Link
                    href={n.href}
                    data-clk={`blog_gnb.${n.name}`}
                    aria-current={active ? "page" : undefined}
                    className={`inline-block py-3 border-b-2 ${active ? "border-dv-green text-dv-green font-bold" : "border-transparent text-dv-text-2 hover:text-dv-text"}`}
                  >
                    {n.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="ml-auto flex items-center gap-2 text-[13px]">
            <Link href="/shopping" className="px-3 py-1.5 border border-dv-border rounded">블로그 마켓 가입</Link>
            <Link href={user ? "/blog/my" : "/login?next=/blog/my"} className="px-3 py-1.5 border border-dv-border rounded">내 블로그</Link>
            <Link href="/blog/write" data-clk="blog_gnb.write" className="dv-btn-green px-4 py-1.5">글쓰기</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
