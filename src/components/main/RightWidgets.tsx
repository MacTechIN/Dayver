"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Block, LazyData, ProductMaterial } from "@/lib/main";

/**
 * 우측 컬럼의 지연 로드 위젯 (네이버 /nvhaproxy/v2/pc/lazy 블록 재해석):
 * 마운트 후 /api/lazy 한 번 호출 → 날씨 / 증시 / 위젯 보드(캘린더·오디오·사전·메모).
 */
export function RightWidgets({ rightShopping, loggedIn }: { rightShopping: Block<ProductMaterial>; loggedIn: boolean }) {
  const [lazy, setLazy] = useState<LazyData | null>(null);
  const load = useCallback(() => fetch("/api/lazy").then((r) => r.json()).then(setLazy), []);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <AdCard label="AD" height={120} gradient="linear-gradient(135deg,#c084fc,#f472b6)" title="역대급 멤버십 전용 특가 오픈!" sub="오늘 지나면 사라지는 하루 한정 라인업" href="/shopping/deals" />
      <RightShopping block={rightShopping} />
      <WeatherWidget block={lazy?.["PC-WEATHER"]} />
      <StockWidget block={lazy?.["PC-STOCK"]} onRefresh={load} />
      <AdCard label="AD" height={90} gradient="linear-gradient(135deg,#34d399,#06b6d4)" title="데이버 카페 만들기" sub="관심사가 같은 사람들과 지금 시작하세요" href="/cafe/create" />
      <WidgetBoard lazy={lazy} loggedIn={loggedIn} />
    </>
  );
}

function AdCard({ label, height, gradient, title, sub, href }: { label: string; height: number; gradient: string; title: string; sub: string; href: string }) {
  return (
    <Link href={href} className="dv-card mt-3 block overflow-hidden" aria-label={`${label} ${title}`}>
      <div className="relative text-white p-4 flex flex-col justify-center" style={{ height, background: gradient }}>
        <span className="absolute right-2 top-2 text-[10px] border border-white/60 rounded px-1">{label}</span>
        <b className="text-[17px]">{title}</b>
        <span className="text-[12px] opacity-90">{sub}</span>
      </div>
    </Link>
  );
}

function RightShopping({ block }: { block: Block<ProductMaterial> }) {
  return (
    <section aria-label="요즘 많이 찾는 상품" className="dv-card mt-3 p-4">
      <div className="grid grid-cols-[76px_1fr] gap-3">
        <div>
          <h3 className="font-bold text-[15px] leading-tight">요즘<br />많이 찾는<br />상품은</h3>
          <span className="mt-3 inline-block text-[10px] border border-dv-border rounded px-1 text-dv-text-3">AD</span>
        </div>
        <ul className="grid grid-cols-3 gap-2">
          {block.materials.map((p) => (
            <li key={p.id}>
              <Link href={`/shopping/product/${p.id}`} className="block">
                <div className="dv-thumb aspect-square rounded-md text-[11px]" style={{ background: p.image_color }}>{p.channel_name}</div>
                <p className="mt-1.5 text-[12px] dv-clamp-2">{p.name}</p>
                <p className="text-[12px]"><b className="text-dv-red">{Math.round(p.discount_rate)}%</b> <b>{p.sale_price.toLocaleString()}</b>원</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WeatherWidget({ block }: { block?: Block }) {
  const now = block?.now as { regionName: string; text: string; temperature: number; minTemperature: number; maxTemperature: number; pm10Legend: string; pm25Legend: string } | undefined;
  const forecast = (block?.forecast as Array<{ timeText: string; temperature: number; text: string }>) ?? [];
  return (
    <section aria-label="날씨" className="dv-card mt-3 p-4">
      <div className="flex items-center justify-between text-[13px]">
        <Link href={String(block?.href ?? "/weather")} className="font-bold text-[15px]">날씨</Link>
        <span className="text-dv-text-3">{now?.regionName ?? "위치 확인 중"}</span>
      </div>
      {!now ? (
        <div className="h-24 animate-pulse bg-dv-bg-2 rounded mt-3" aria-label="불러오는 중" />
      ) : (
        <>
          <Link href={String(block?.href ?? "/weather")} className="flex items-center gap-3 mt-3">
            <span className="text-4xl" aria-hidden>{now.text === "맑음" ? "☀️" : "⛅"}</span>
            <span><b className="text-[26px]">{now.temperature}°</b> <span className="text-[14px]">{now.text}</span>
              <span className="block text-[12px] text-dv-text-3">최저기온 {now.minTemperature}° 최고기온 {now.maxTemperature}°</span></span>
            <span className="ml-auto text-[12px] text-dv-text-2 text-right">미세 <b className="text-dv-blue">{now.pm10Legend}</b><br />초미세 <b className="text-dv-blue">{now.pm25Legend}</b></span>
          </Link>
          <ul className="flex justify-between mt-3 pt-3 border-t border-dv-border-2 text-[12px] text-center">
            {forecast.map((f) => (
              <li key={f.timeText}><span className="block text-dv-text-3">{f.timeText}</span><span aria-hidden>{f.text === "맑음" ? "☀️" : "☁️"}</span><span className="block font-bold">{f.temperature}°</span></li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function StockWidget({ block, onRefresh }: { block?: Block; onRefresh: () => void }) {
  const items = (block?.materials as Array<{ title: string; value: number; diffValue: number; diffRate: number; up: boolean; href: string }>) ?? [];
  const popular = (block?.popular as Array<{ name: string; code?: string; rate: number; price: number; up: boolean }>) ?? [];
  return (
    <section aria-label="증시" className="dv-card mt-3 p-4">
      <div className="flex items-center justify-between">
        <Link href="/stock" className="font-bold text-[15px]">증시</Link>
        <div className="flex gap-1">
          <button type="button" aria-label="정보 더보기" className="w-7 h-7 rounded-full border border-dv-border text-[12px]">i</button>
          <button type="button" aria-label="새로고침" onClick={onRefresh} className="w-7 h-7 rounded-full border border-dv-border text-[12px]">↻</button>
        </div>
      </div>
      {items.length === 0 ? <div className="h-16 animate-pulse bg-dv-bg-2 rounded mt-3" /> : (
        <ul className="grid grid-cols-2 gap-3 mt-3">
          {items.map((s) => (
            <li key={s.title}>
              <Link href={s.href} className="block rounded-md p-3" style={{ background: s.up ? "#fff1f1" : "#eef4ff" }}>
                <span className="text-[13px] text-dv-text-2">{s.title}</span>
                <b className="block text-[18px]">{s.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                <span className={`text-[12px] ${s.up ? "text-dv-red" : "text-dv-blue"}`}>{s.up ? "▲" : "▼"} {s.diffValue.toFixed(2)} {s.up ? "+" : "-"}{s.diffRate}%</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-3 pt-3 border-t border-dv-border-2 text-[13px] space-y-1.5">
        {popular.map((p) => (
          <li key={p.name} className="flex justify-between">
            <Link href={p.code ? `/stock/item/${p.code}` : `/stock/search?query=${encodeURIComponent(p.name)}`}>{p.name}</Link>
            <span className={p.up ? "text-dv-red" : "text-dv-blue"}>{p.up ? "▲" : "▼"} {Math.abs(p.rate)}% <span className="text-dv-text-2 ml-1">{p.price.toLocaleString()}</span></span>
          </li>
        ))}
        {popular.length > 0 && <li className="text-right text-[12px] text-dv-text-3"><Link href="/stock">인기종목 더보기 ›</Link></li>}
      </ul>
    </section>
  );
}

function WidgetBoard({ lazy, loggedIn }: { lazy: LazyData | null; loggedIn: boolean }) {
  const [page, setPage] = useState(0);
  const [memoDraft, setMemoDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const serverMemo = typeof lazy?.["PC-MEMO"]?.content === "string" ? (lazy["PC-MEMO"].content as string) : "";
  const memo = memoDraft ?? serverMemo;
  const setMemo = setMemoDraft;
  const cal = lazy?.["PC-CALENDAR"];
  const dict = lazy?.["PC-DICTIONARY"];
  const audio = lazy?.["PC-VIBE-AUDIO"];
  const cells = (cal?.materials as Array<{ day: number; inMonth: boolean; holiday?: string; today?: boolean }>) ?? [];
  const pages = ["캘린더", "오디오", "사전·메모"];
  const saveMemo = async () => {
    const r = await fetch("/api/memo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: memo }) });
    setSaved(r.ok ? "저장됨" : "로그인이 필요합니다");
    setTimeout(() => setSaved(null), 1500);
  };
  return (
    <section aria-label="위젯" className="dv-card mt-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[15px]">{pages[page]}</h3>
        <div className="flex items-center gap-1 text-[12px] text-dv-text-3">
          <span>{page + 1}/{pages.length}</span>
          <button type="button" aria-label="이전 페이지" onClick={() => setPage((p) => (p + pages.length - 1) % pages.length)} className="w-6 h-6 rounded-full border border-dv-border">‹</button>
          <button type="button" aria-label="다음 페이지" onClick={() => setPage((p) => (p + 1) % pages.length)} className="w-6 h-6 rounded-full border border-dv-border">›</button>
        </div>
      </div>
      {page === 0 && (
        cal ? (
          <table className="w-full mt-3 text-[12px] text-center" aria-label={`${cal.year}년 ${cal.month}월 캘린더 - 이번 달의 일정을 날짜별로 확인할 수 있는 표입니다.`}>
            <thead><tr>{["일", "월", "화", "수", "목", "금", "토"].map((d, i) => <th key={d} scope="col" className={`font-normal py-1 ${i === 0 ? "text-dv-red" : i === 6 ? "text-dv-blue" : "text-dv-text-3"}`}>{d}</th>)}</tr></thead>
            <tbody>
              {Array.from({ length: cells.length / 7 }).map((_, r) => (
                <tr key={r}>
                  {cells.slice(r * 7, r * 7 + 7).map((c, i) => (
                    <td key={i} className={`py-1 ${c.inMonth ? "" : "text-dv-border"} ${c.holiday && c.inMonth ? "text-dv-red" : ""}`} title={c.holiday}>
                      <span className={`inline-grid place-items-center w-6 h-6 rounded-full ${c.today ? "bg-dv-green text-white font-bold" : ""}`}>{c.day}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="h-40 animate-pulse bg-dv-bg-2 rounded mt-3" />
      )}
      {page === 1 && (
        <ul className="mt-3 space-y-2">
          {((audio?.materials as Array<{ title: string; color: string; href: string }>) ?? []).map((a) => (
            <li key={a.title}><Link href={a.href} className="flex items-center gap-3 text-[13px]"><span className="w-10 h-10 rounded-md grid place-items-center text-white" style={{ background: a.color }} aria-hidden>▶</span><span className="dv-ellipsis">{a.title}<span className="sr-only"> 재생</span></span></Link></li>
          ))}
          <li className="text-right"><button type="button" className="text-[12px] text-dv-text-3">다른 추천 보기</button></li>
        </ul>
      )}
      {page === 2 && (
        <div className="mt-3 text-[13px]">
          <div className="flex items-center justify-between"><Link href="/search?query=영어사전" className="font-bold">영어사전</Link><Link href="/search?query=번역" className="text-dv-text-3 text-[12px]">번역하기</Link></div>
          <Link href={`/search?query=${encodeURIComponent(String(dict?.sentence ?? ""))}`} className="block mt-1 p-3 bg-dv-bg-3 rounded"><b>{String(dict?.sentence ?? "…")}</b><span className="block text-dv-text-3">{String(dict?.translation ?? "")}</span></Link>
          <div className="mt-3 flex items-center justify-between"><span className="font-bold">메모</span>{saved && <span className="text-[12px] text-dv-green">{saved}</span>}</div>
          {loggedIn ? (
            <>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} className="w-full mt-1 p-2 border border-dv-border rounded resize-none text-[13px]" placeholder="메모를 입력하세요" />
              <button type="button" onClick={saveMemo} className="mt-1 text-[12px] px-3 py-1 rounded bg-dv-bg-2">저장</button>
            </>
          ) : (
            <Link href="/login?next=/" className="block mt-1 p-3 border border-dashed border-dv-border rounded text-center text-dv-text-3">메모 로그인하기</Link>
          )}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-dv-border-2 text-[12px] text-dv-text-3 flex justify-between">
        <span>모바일 데이버 메인</span>
        <span aria-hidden>▣</span>
      </div>
    </section>
  );
}
