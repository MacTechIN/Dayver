import type { Metadata } from "next";
import Link from "next/link";
import { all } from "@/lib/db";
import { TopBar } from "@/components/common/TopBar";
import { Footer } from "@/components/common/Footer";
import { SearchBox } from "@/components/main/SearchBox";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const q = String((await searchParams).query ?? "");
  return { title: q ? `${q} : DAYVER 통합검색` : "DAYVER 통합검색" };
}

const TABS = [
  { key: "all", name: "통합", ssc: "tab.nx.all" },
  { key: "news", name: "뉴스", ssc: "tab.news.all" },
  { key: "blog", name: "블로그", ssc: "tab.blog.all" },
  { key: "cafe", name: "카페", ssc: "tab.cafe.all" },
  { key: "shopping", name: "쇼핑", ssc: "tab.shop.all" },
];

type NewsRow = { id: number; title: string; summary: string; press_name: string; created_at: string; image_color: string };
type BlogRow = { id: number; title: string; content: string; username: string; nickname: string; created_at: string; image_color: string | null };
type CafeRow = { id: number; title: string; content: string; cafe_slug: string; cafe_name: string; created_at: string };
type CafeInfo = { slug: string; name: string; description: string; category: string; color: string; member_count: number };
type ProductRow = { id: number; name: string; sale_price: number; discount_rate: number; image_color: string; channel_name: string; review_count: number };

/** 통합검색 (search.naver.com 재해석): 탭 + 섹션별 결과 + 연관 검색어 */
export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = String(sp.query ?? "").trim();
  const where = String(sp.where ?? "nexearch");
  const tab = TABS.find((t) => t.key === where) ?? TABS[0];
  const like = `%${q}%`;
  const limit = tab.key === "all" ? 4 : 30;

  const news = q && (tab.key === "all" || tab.key === "news") ? all<NewsRow>("SELECT a.id, a.title, a.summary, p.name press_name, a.created_at, a.image_color FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.title LIKE ? OR a.summary LIKE ? ORDER BY a.created_at DESC LIMIT ?", like, like, limit) : [];
  const blogs = q && (tab.key === "all" || tab.key === "blog") ? all<BlogRow>("SELECT b.id, b.title, b.content, u.username, u.nickname, b.created_at, b.image_color FROM blog_posts b JOIN users u ON u.id = b.user_id WHERE b.is_public = 1 AND (b.title LIKE ? OR b.content LIKE ?) ORDER BY b.created_at DESC LIMIT ?", like, like, limit) : [];
  const cafes = q && (tab.key === "all" || tab.key === "cafe") ? all<CafeInfo>("SELECT c.slug, c.name, c.description, c.category, c.color, (SELECT COUNT(*) FROM cafe_members m WHERE m.cafe_id = c.id) member_count FROM cafes c WHERE c.name LIKE ? OR c.description LIKE ? LIMIT ?", like, like, tab.key === "all" ? 3 : 20) : [];
  const cafePosts = q && (tab.key === "all" || tab.key === "cafe") ? all<CafeRow>("SELECT p.id, p.title, p.content, c.slug cafe_slug, c.name cafe_name, p.created_at FROM cafe_posts p JOIN cafes c ON c.id = p.cafe_id WHERE p.title LIKE ? OR p.content LIKE ? ORDER BY p.created_at DESC LIMIT ?", like, like, limit) : [];
  const products = q && (tab.key === "all" || tab.key === "shopping") ? all<ProductRow>("SELECT p.id, p.name, p.sale_price, p.discount_rate, p.image_color, c.name channel_name, p.review_count FROM shop_products p JOIN shop_channels c ON c.id = p.channel_id WHERE p.name LIKE ? ORDER BY p.review_count DESC LIMIT ?", like, tab.key === "all" ? 6 : 40) : [];
  const related = q ? all<{ name: string }>("SELECT DISTINCT name FROM shop_categories WHERE name LIKE ? LIMIT 8", like).map((r) => r.name) : [];
  const total = news.length + blogs.length + cafes.length + cafePosts.length + products.length;

  return (
    <>
      <TopBar service="통합검색" serviceHref="/search">
        <div className="ml-6"><SearchBox initial={q} compact /></div>
      </TopBar>
      <nav aria-label="검색 탭" className="border-b border-dv-border bg-white">
        <ul role="tablist" className="dv-container flex gap-6 text-[14px]">
          {TABS.map((t) => (
            <li key={t.key} role="presentation">
              <Link role="tab" aria-selected={tab.key === t.key} href={`/search?where=${t.key}&query=${encodeURIComponent(q)}&ssc=${t.ssc}`} className={`block py-3 border-b-2 ${tab.key === t.key ? "border-dv-green text-dv-green font-bold" : "border-transparent text-dv-text-2"}`}>{t.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <main id="content" className="dv-container grid grid-cols-[760px_1fr] gap-10 py-6 min-h-[60vh]">
        <div>
          {!q && <p className="text-dv-text-3 py-20 text-center">검색어를 입력해 주세요.</p>}
          {q && total === 0 && (
            <section className="dv-card p-10 text-center">
              <p className="text-[16px]"><b>&lsquo;{q}&rsquo;</b>에 대한 검색결과가 없습니다.</p>
              <p className="text-dv-text-3 mt-2 text-[13px]">단어의 철자가 정확한지 확인해 보세요. 검색어의 단어 수를 줄이거나, 보다 일반적인 검색어로 다시 검색해 보세요.</p>
            </section>
          )}
          {products.length > 0 && (
            <section aria-label="쇼핑" className="dv-card p-5 mb-4">
              <h2 className="font-bold text-[16px] mb-3">쇼핑 <span className="text-dv-text-3 text-[12px] font-normal">데이버플러스 스토어</span></h2>
              <ul className="grid grid-cols-6 gap-3">
                {products.map((p) => (
                  <li key={p.id}><Link href={`/shopping/product/${p.id}`} className="block">
                    <div className="dv-thumb aspect-square rounded-md text-[11px]" style={{ background: p.image_color }}>{p.channel_name}</div>
                    <p className="text-[12px] mt-1.5 dv-clamp-2">{p.name}</p>
                    <p className="text-[12px]">{p.discount_rate > 0 && <b className="text-dv-red mr-1">{Math.round(p.discount_rate)}%</b>}<b>{p.sale_price.toLocaleString()}</b>원</p>
                  </Link></li>
                ))}
              </ul>
              {tab.key === "all" && <Link href={`/search?where=shopping&query=${encodeURIComponent(q)}`} className="block text-center mt-3 text-[13px] text-dv-text-2">쇼핑 더보기 ›</Link>}
            </section>
          )}
          {news.length > 0 && (
            <section aria-label="뉴스" className="dv-card p-5 mb-4">
              <h2 className="font-bold text-[16px] mb-3">뉴스</h2>
              <ul className="divide-y divide-dv-border-2">
                {news.map((a) => (
                  <li key={a.id} className="py-3 flex gap-4">
                    <Link href={`/news/article/${a.id}`} className="dv-thumb w-[120px] h-[80px] rounded-md shrink-0 text-[11px]" style={{ background: a.image_color }}>{a.press_name}</Link>
                    <div className="min-w-0">
                      <Link href={`/news/article/${a.id}`} className="font-bold text-[15px] dv-clamp-2">{a.title}</Link>
                      <p className="text-[13px] text-dv-text-2 mt-1 dv-clamp-2">{a.summary}</p>
                      <p className="text-[12px] text-dv-text-3 mt-1">{a.press_name} · {a.created_at.slice(0, 16)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {tab.key === "all" && <Link href={`/search?where=news&query=${encodeURIComponent(q)}`} className="block text-center mt-2 text-[13px] text-dv-text-2">뉴스 더보기 ›</Link>}
            </section>
          )}
          {(cafes.length > 0 || cafePosts.length > 0) && (
            <section aria-label="카페" className="dv-card p-5 mb-4">
              <h2 className="font-bold text-[16px] mb-3">카페</h2>
              {cafes.length > 0 && (
                <ul className="grid grid-cols-3 gap-3 mb-4">
                  {cafes.map((c) => (
                    <li key={c.slug}><Link href={`/cafe/${c.slug}`} className="flex items-center gap-3 p-3 rounded-md bg-dv-bg-3">
                      <span className="w-10 h-10 rounded-lg shrink-0" style={{ background: c.color }} aria-hidden />
                      <span className="min-w-0"><b className="block dv-ellipsis">{c.name}</b><span className="text-[12px] text-dv-text-3">{c.category} · 멤버 {c.member_count}</span></span>
                    </Link></li>
                  ))}
                </ul>
              )}
              <ul className="divide-y divide-dv-border-2">
                {cafePosts.map((p) => (
                  <li key={p.id} className="py-3">
                    <Link href={`/cafe/${p.cafe_slug}/post/${p.id}`} className="font-bold text-[15px] dv-ellipsis block">{p.title}</Link>
                    <p className="text-[13px] text-dv-text-2 dv-clamp-2">{p.content}</p>
                    <p className="text-[12px] text-dv-text-3 mt-1">{p.cafe_name} · {p.created_at.slice(0, 16)}</p>
                  </li>
                ))}
              </ul>
              {tab.key === "all" && <Link href={`/search?where=cafe&query=${encodeURIComponent(q)}`} className="block text-center mt-2 text-[13px] text-dv-text-2">카페 더보기 ›</Link>}
            </section>
          )}
          {blogs.length > 0 && (
            <section aria-label="블로그" className="dv-card p-5 mb-4">
              <h2 className="font-bold text-[16px] mb-3">블로그</h2>
              <ul className="divide-y divide-dv-border-2">
                {blogs.map((b) => (
                  <li key={b.id} className="py-3 flex gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-dv-text-3"><Link href={`/blog/${b.username}`}>{b.nickname}</Link> · {b.created_at.slice(0, 10)}</p>
                      <Link href={`/blog/${b.username}/${b.id}`} className="font-bold text-[15px] dv-ellipsis block mt-0.5">{b.title}</Link>
                      <p className="text-[13px] text-dv-text-2 dv-clamp-2">{b.content}</p>
                    </div>
                    {b.image_color && <Link href={`/blog/${b.username}/${b.id}`} className="dv-thumb w-[100px] h-[76px] rounded-md shrink-0 text-[11px]" style={{ background: b.image_color }}>{b.nickname}</Link>}
                  </li>
                ))}
              </ul>
              {tab.key === "all" && <Link href={`/search?where=blog&query=${encodeURIComponent(q)}`} className="block text-center mt-2 text-[13px] text-dv-text-2">블로그 더보기 ›</Link>}
            </section>
          )}
        </div>
        <aside className="min-w-0">
          {related.length > 0 && (
            <section aria-label="연관 검색어" className="dv-card p-4">
              <h2 className="font-bold text-[14px] mb-2">연관 검색어 <span className="text-[11px] text-dv-text-3 font-normal">많이 찾는</span></h2>
              <ul className="flex flex-wrap gap-2 text-[13px]">
                {related.map((r) => <li key={r}><Link href={`/search?query=${encodeURIComponent(r)}&sm=tab_clk.ndT`} className="px-3 py-1 rounded-full bg-dv-bg-2">{r}</Link></li>)}
              </ul>
            </section>
          )}
          <section aria-label="검색 도움말" className="dv-card p-4 mt-3 text-[12px] text-dv-text-3">
            검색어 <b className="text-dv-text">{q || "…"}</b> · 탭 <b className="text-dv-text">{tab.name}</b> · sscode {tab.ssc}
          </section>
        </aside>
      </main>
      <Footer compact />
    </>
  );
}
