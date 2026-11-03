import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";
import type { HistoryPoint, StockIndex, StockItem } from "@/lib/stock";
import { capText, won } from "@/lib/stock";

export function StockHeader({ active = "home" }: { active?: "home" | "my" | "search" }) {
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="증권" serviceHref="/stock" serviceColor="#0068c3">
        <form action="/stock/search" method="get" role="search" className="ml-6 flex items-center border border-dv-border rounded-full overflow-hidden">
          <label htmlFor="stock-q" className="sr-only">종목명 또는 코드 검색</label>
          <input id="stock-q" name="query" placeholder="종목명, 코드 검색" className="px-4 py-1.5 w-[260px] outline-none text-[13px]" />
          <button type="submit" aria-label="검색" className="px-3 text-dv-text-2">⌕</button>
        </form>
      </TopBar>
      <nav aria-label="증권 메뉴" className="bg-white border-b border-dv-border">
        <ul className="dv-container flex gap-6 text-[14px]">
          <li><Link href="/stock" className={`block py-3 border-b-2 ${active === "home" ? "border-dv-blue text-dv-blue font-bold" : "border-transparent text-dv-text-2"}`}>증권 홈</Link></li>
          <li><Link href="/stock/domestic/index/DAYSPI" className="block py-3 border-b-2 border-transparent text-dv-text-2">데이스피</Link></li>
          <li><Link href="/stock/domestic/index/DAYSDAQ" className="block py-3 border-b-2 border-transparent text-dv-text-2">데이스닥</Link></li>
          <li><Link href="/stock/my" className={`block py-3 border-b-2 ${active === "my" ? "border-dv-blue text-dv-blue font-bold" : "border-transparent text-dv-text-2"}`}>관심종목</Link></li>
          <li><Link href="/news/section/economy" className="block py-3 border-b-2 border-transparent text-dv-text-2">경제 뉴스</Link></li>
        </ul>
      </nav>
    </>
  );
}

/** 선 차트 SVG (스파크라인/상세 차트 공용) */
export function LineChart({ points, width = 300, height = 80, up, detailed = false }: { points: HistoryPoint[]; width?: number; height?: number; up: boolean; detailed?: boolean }) {
  if (points.length < 2) return null;
  const vals = points.map((p) => p.close);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = detailed ? 24 : 4;
  const x = (i: number) => pad + (i / (points.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const d = vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const color = up ? "#ff3d3d" : "#0068c3";
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={`최근 ${points.length}일 추이, 최저 ${min.toLocaleString()} 최고 ${max.toLocaleString()}`}>
      {detailed && [0, 0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={pad} x2={width - pad} y1={pad + t * (height - pad * 2)} y2={pad + t * (height - pad * 2)} stroke="#e3e5e8" strokeWidth="1" />)}
      <path d={`${d} L${x(points.length - 1).toFixed(1)},${height - pad} L${x(0).toFixed(1)},${height - pad} Z`} fill={color} opacity="0.08" />
      <path d={d} fill="none" stroke={color} strokeWidth={detailed ? 2 : 1.5} />
      {detailed && (
        <>
          <text x={pad} y={pad - 6} fontSize="10" fill="#888">{max.toLocaleString()}</text>
          <text x={pad} y={height - 4} fontSize="10" fill="#888">{min.toLocaleString()}</text>
          <text x={width - pad} y={height - 4} fontSize="10" fill="#888" textAnchor="end">{points[points.length - 1].day.slice(5)}</text>
          <text x={pad + 40} y={height - 4} fontSize="10" fill="#888">{points[0].day.slice(5)}</text>
        </>
      )}
    </svg>
  );
}

export function Change({ change, rate, big = false }: { change: number; rate: number; big?: boolean }) {
  const up = change > 0;
  const flat = change === 0;
  const cls = flat ? "text-dv-text-3" : up ? "text-dv-red" : "text-dv-blue";
  return <span className={`${cls} ${big ? "text-[16px]" : "text-[12px]"}`}>{flat ? "-" : up ? "▲" : "▼"} {Math.abs(change).toLocaleString()} {up ? "+" : ""}{rate}%</span>;
}

export function IndexCard({ idx, history }: { idx: StockIndex; history: HistoryPoint[] }) {
  const up = idx.change >= 0;
  return (
    <Link href={`/stock/domestic/index/${idx.code}`} data-clk={`stock.index.${idx.code.toLowerCase()}`} className="dv-card p-5 block hover:shadow">
      <span className="text-[13px] text-dv-text-2">{idx.name}</span>
      <b className="block text-[28px]">{idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
      <Change change={idx.change} rate={idx.change_rate} big />
      <div className="mt-3"><LineChart points={history} width={360} height={90} up={up} /></div>
    </Link>
  );
}

export function StockTable({ items, caption, showRank = false }: { items: StockItem[]; caption: string; showRank?: boolean }) {
  return (
    <table className="w-full text-[13px]">
      <caption className="sr-only">{caption}</caption>
      <thead><tr className="text-dv-text-3 text-[12px] border-b border-dv-border">
        {showRank && <th scope="col" className="py-2 font-normal text-left w-8">순위</th>}
        <th scope="col" className="py-2 font-normal text-left">종목명</th><th scope="col" className="font-normal text-right">현재가</th><th scope="col" className="font-normal text-right">전일비</th><th scope="col" className="font-normal text-right">등락률</th><th scope="col" className="font-normal text-right">거래량</th><th scope="col" className="font-normal text-right">시가총액</th>
      </tr></thead>
      <tbody>
        {items.map((s, i) => (
          <tr key={s.code} className="border-b border-dv-border-2 hover:bg-dv-bg-3">
            {showRank && <td className="py-2 font-bold text-dv-text-2">{i + 1}</td>}
            <th scope="row" className="py-2 text-left font-bold"><Link href={`/stock/item/${s.code}`} data-clk="stock.table.item">{s.name}</Link> <span className="text-[11px] text-dv-text-3 font-normal">{s.market === "DAYSPI" ? "데이스피" : "데이스닥"}</span></th>
            <td className="text-right font-bold">{won(s.price)}</td>
            <td className={`text-right ${s.change > 0 ? "text-dv-red" : s.change < 0 ? "text-dv-blue" : ""}`}>{s.change > 0 ? "▲" : s.change < 0 ? "▼" : "-"} {won(Math.abs(s.change))}</td>
            <td className={`text-right ${s.change > 0 ? "text-dv-red" : s.change < 0 ? "text-dv-blue" : ""}`}>{s.change_rate > 0 ? "+" : ""}{s.change_rate}%</td>
            <td className="text-right text-dv-text-2">{won(s.volume)}</td>
            <td className="text-right text-dv-text-2">{capText(s.market_cap)}</td>
          </tr>
        ))}
        {items.length === 0 && <tr><td colSpan={showRank ? 7 : 6} className="py-8 text-center text-dv-text-3">종목이 없습니다.</td></tr>}
      </tbody>
    </table>
  );
}
