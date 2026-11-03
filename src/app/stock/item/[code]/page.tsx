import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/common/Footer";
import { Change, LineChart, StockHeader } from "@/components/stock/StockParts";
import { getCurrentUser } from "@/lib/auth";
import { capText, getHistory, getStock, isWatching, listComments, listStocks, won } from "@/lib/stock";
import { addStockCommentAction, deleteStockCommentAction, toggleWatchAction } from "@/lib/actions/stock";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getStock((await params).code);
  return { title: s ? `${s.name} ${won(s.price)} - DAYVER 증권` : "DAYVER 증권" };
}

export default async function StockItemPage({ params }: Props) {
  const { code } = await params;
  const s = getStock(code);
  if (!s) notFound();
  const user = await getCurrentUser();
  const watching = user ? isWatching(user.id, code) : false;
  const history = getHistory(code);
  const comments = listComments(code);
  const peers = listStocks({ market: s.market, orderBy: "market_cap", desc: true, limit: 40 }).filter((p) => p.sector === s.sector && p.code !== s.code).slice(0, 5);
  const up = s.change >= 0;
  const high = Math.max(...history.map((h) => h.close));
  const low = Math.min(...history.map((h) => h.close));
  return (
    <>
      <StockHeader />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_320px] gap-5">
          <div>
            <section aria-label="종목 시세" className="dv-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-[22px] font-black">{s.name} <span className="text-[13px] text-dv-text-3 font-normal">{s.code} · {s.market === "DAYSPI" ? "데이스피" : "데이스닥"} · {s.sector}</span></h1>
                  <div className="flex items-end gap-4 mt-2">
                    <b className={`text-[40px] leading-none ${up ? "text-dv-red" : "text-dv-blue"}`}>{won(s.price)}</b>
                    <Change change={s.change} rate={s.change_rate} big />
                  </div>
                </div>
                <form action={toggleWatchAction}>
                  <input type="hidden" name="code" value={s.code} />
                  <button type="submit" aria-pressed={watching} data-clk="stock.item.watch" className={`px-4 py-2 rounded-md border text-[13px] font-bold ${watching ? "bg-dv-green text-white border-dv-green" : "border-dv-border"}`}>{watching ? "★ 관심 등록됨" : "☆ 관심 등록"}</button>
                </form>
              </div>
              <div className="mt-5"><LineChart points={history} width={820} height={240} up={up} detailed /></div>
              <dl className="grid grid-cols-4 gap-3 mt-5 text-[13px]">
                <div className="bg-dv-bg-3 rounded p-3"><dt className="text-dv-text-3">거래량</dt><dd className="font-bold">{won(s.volume)}</dd></div>
                <div className="bg-dv-bg-3 rounded p-3"><dt className="text-dv-text-3">시가총액</dt><dd className="font-bold">{capText(s.market_cap)}</dd></div>
                <div className="bg-dv-bg-3 rounded p-3"><dt className="text-dv-text-3">30일 최고</dt><dd className="font-bold text-dv-red">{won(high)}</dd></div>
                <div className="bg-dv-bg-3 rounded p-3"><dt className="text-dv-text-3">30일 최저</dt><dd className="font-bold text-dv-blue">{won(low)}</dd></div>
              </dl>
            </section>
            <section aria-label="종목 정보" className="dv-card p-5 mt-4">
              <h2 className="font-bold text-[16px] mb-2">종목 정보</h2>
              <p className="text-[13px] text-dv-text-2">{s.description}</p>
            </section>
            <section aria-label="종목 토론" className="dv-card p-5 mt-4">
              <h2 className="font-bold text-[16px] mb-3">종목 토론 <span className="text-[12px] text-dv-text-3 font-normal">{comments.length}</span></h2>
              {user ? (
                <form action={addStockCommentAction} className="flex gap-2 mb-4">
                  <input type="hidden" name="code" value={s.code} />
                  <label htmlFor="comment" className="sr-only">토론 글</label>
                  <input id="comment" name="content" required maxLength={500} placeholder="이 종목에 대한 의견을 남겨 보세요" className="flex-1 border border-dv-border rounded px-3 py-2 text-[13px]" />
                  <button type="submit" className="dv-btn-green px-4 text-[13px]">등록</button>
                </form>
              ) : <p className="text-[13px] text-dv-text-3 mb-4"><Link href={`/login?next=/stock/item/${s.code}`} className="text-dv-green font-bold">로그인</Link> 후 토론에 참여할 수 있습니다.</p>}
              <ul className="divide-y divide-dv-border-2 text-[13px]">
                {comments.map((c) => (
                  <li key={c.id} className="py-3 flex gap-3">
                    <span className="w-8 h-8 rounded-full shrink-0 grid place-items-center text-white font-bold" style={{ background: c.avatar_color }} aria-hidden>{c.nickname.slice(0, 1)}</span>
                    <div className="flex-1 min-w-0"><b>{c.nickname}</b> <time className="text-dv-text-3 text-[12px]">{c.created_at.slice(5, 16)}</time><p className="mt-0.5">{c.content}</p></div>
                    {user?.id === c.user_id && <form action={deleteStockCommentAction}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="code" value={s.code} /><button type="submit" className="text-[12px] text-dv-text-3">삭제</button></form>}
                  </li>
                ))}
                {comments.length === 0 && <li className="py-6 text-center text-dv-text-3">아직 글이 없습니다.</li>}
              </ul>
            </section>
          </div>
          <aside className="min-w-0">
            <section aria-label="같은 업종 종목" className="dv-card p-4">
              <h2 className="font-bold text-[14px] mb-2">{s.sector} 업종</h2>
              <ul className="text-[13px] divide-y divide-dv-border-2">{peers.map((p) => <li key={p.code} className="py-1.5 flex justify-between"><Link href={`/stock/item/${p.code}`}>{p.name}</Link><span className={p.change >= 0 ? "text-dv-red" : "text-dv-blue"}>{won(p.price)}</span></li>)}{peers.length === 0 && <li className="py-2 text-dv-text-3">없음</li>}</ul>
            </section>
            <section aria-label="최근 30일 종가" className="dv-card p-4 mt-4">
              <h2 className="font-bold text-[14px] mb-2">최근 종가</h2>
              <table className="w-full text-[12px]"><tbody>{history.slice(-7).reverse().map((h) => <tr key={h.day} className="border-b border-dv-border-2"><th scope="row" className="py-1 text-left font-normal text-dv-text-2">{h.day}</th><td className="text-right font-bold">{won(h.close)}</td></tr>)}</tbody></table>
            </section>
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
