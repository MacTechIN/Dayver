import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/common/Footer";
import { LoginBox } from "@/components/common/LoginBox";
import { IndexCard, StockHeader, StockTable } from "@/components/stock/StockParts";
import { getCurrentUser } from "@/lib/auth";
import { getHistory, listIndices, listStocks, listWatchlist, won } from "@/lib/stock";
import { listArticlesBySection } from "@/lib/news";

export const metadata: Metadata = { title: "DAYVER 증권" };

export default async function StockHome() {
  const user = await getCurrentUser();
  const indices = listIndices();
  const popular = listStocks({ orderBy: "search_rank", limit: 10 });
  const gainers = listStocks({ orderBy: "change_rate", desc: true, limit: 5 });
  const losers = listStocks({ orderBy: "change_rate", limit: 5 });
  const caps = listStocks({ orderBy: "market_cap", desc: true, limit: 10 });
  const watch = user ? listWatchlist(user.id) : [];
  const news = listArticlesBySection("경제", 6);
  return (
    <>
      <StockHeader active="home" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_320px] gap-5">
          <div>
            <h1 className="sr-only">증권 홈</h1>
            <section aria-label="주요 지수" className="grid grid-cols-2 gap-4">
              {indices.map((i) => <IndexCard key={i.code} idx={i} history={getHistory(i.code)} />)}
            </section>
            <section aria-label="인기 검색 종목" className="dv-card p-5 mt-4">
              <h2 className="font-bold text-[16px] mb-2">인기 검색 종목 <span className="text-[12px] text-dv-text-3 font-normal">검색 순위 기준</span></h2>
              <StockTable items={popular} caption="인기 검색 종목" showRank />
            </section>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <section aria-label="상승 TOP 5" className="dv-card p-5">
                <h2 className="font-bold text-[15px] mb-2 text-dv-red">상승 TOP 5</h2>
                <ul className="text-[13px] divide-y divide-dv-border-2">{gainers.map((s) => <li key={s.code} className="py-2 flex justify-between"><Link href={`/stock/item/${s.code}`} className="font-bold">{s.name}</Link><span className="text-dv-red">{won(s.price)} <b>+{s.change_rate}%</b></span></li>)}</ul>
              </section>
              <section aria-label="하락 TOP 5" className="dv-card p-5">
                <h2 className="font-bold text-[15px] mb-2 text-dv-blue">하락 TOP 5</h2>
                <ul className="text-[13px] divide-y divide-dv-border-2">{losers.map((s) => <li key={s.code} className="py-2 flex justify-between"><Link href={`/stock/item/${s.code}`} className="font-bold">{s.name}</Link><span className="text-dv-blue">{won(s.price)} <b>{s.change_rate}%</b></span></li>)}</ul>
              </section>
            </div>
            <section aria-label="시가총액 상위" className="dv-card p-5 mt-4">
              <h2 className="font-bold text-[16px] mb-2">시가총액 상위</h2>
              <StockTable items={caps} caption="시가총액 상위" showRank />
            </section>
          </div>
          <aside className="min-w-0">
            <LoginBox next="/stock" />
            <section aria-label="관심종목" className="dv-card p-4 mt-4">
              <div className="flex items-center justify-between mb-2"><h2 className="font-bold text-[14px]">관심종목</h2><Link href="/stock/my" className="text-[12px] text-dv-text-3">더보기 ›</Link></div>
              {!user ? <p className="text-[13px] text-dv-text-3">로그인하면 관심종목을 볼 수 있습니다.</p> : watch.length === 0 ? <p className="text-[13px] text-dv-text-3">관심종목이 없습니다. 종목 페이지에서 ★ 관심 등록을 눌러 보세요.</p> : (
                <ul className="text-[13px] divide-y divide-dv-border-2">{watch.slice(0, 6).map((s) => <li key={s.code} className="py-1.5 flex justify-between"><Link href={`/stock/item/${s.code}`}>{s.name}</Link><span className={s.change >= 0 ? "text-dv-red" : "text-dv-blue"}>{won(s.price)} {s.change_rate > 0 ? "+" : ""}{s.change_rate}%</span></li>)}</ul>
              )}
            </section>
            <section aria-label="경제 뉴스" className="dv-card p-4 mt-4">
              <h2 className="font-bold text-[14px] mb-2"><Link href="/news/section/economy">경제 뉴스 ›</Link></h2>
              <ul className="text-[13px] space-y-1.5">{news.map((a) => <li key={a.id} className="dv-ellipsis"><Link href={`/news/article/${a.id}`} data-clk="stock.news.title">{a.title}</Link></li>)}</ul>
            </section>
            <p className="text-[12px] text-dv-text-3 mt-3 px-1">모든 종목과 시세는 학습용 허구 데이터입니다.</p>
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
