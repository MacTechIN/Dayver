"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Block, ArticleMaterial, PressMaterial } from "@/lib/main";

const TABS = ["뉴스스탠드", "언론사편집", "엔터", "스포츠", "게임", "경제"];

/**
 * 뉴스스탠드 블록 (네이버 메인 '뉴스스탠드' region 재해석).
 * 탭 클릭 → GET /api/lazy?blockCodeList=PC-MEDIA-WRAPPER&target=PC-MEDIA-NEWSSTAND-<탭>
 */
export function Newsstand({ initial, yonhap }: { initial: Block; yonhap: Block<ArticleMaterial> }) {
  const [blockData, setBlock] = useState<Block>(initial);
  const [tab, setTab] = useState<string>(String(initial.tab ?? "뉴스스탠드"));
  const [page, setPage] = useState<number>(Number(initial.page ?? 1));
  const [view, setView] = useState<"thumbnail" | "list">("thumbnail");
  const [loadedKey, setLoadedKey] = useState(`${initial.tab}|${initial.page}`);

  const isInitial = tab === String(initial.tab) && page === Number(initial.page);
  useEffect(() => {
    if (isInitial) return;
    let alive = true;
    fetch(`/api/lazy?blockCodeList=PC-MEDIA-WRAPPER&target=${encodeURIComponent("PC-MEDIA-NEWSSTAND-" + tab)}&page=${page}`)
      .then((r) => r.json())
      .then((j) => { if (alive) { setBlock(j["PC-MEDIA-WRAPPER"].blocks[0]); setLoadedKey(`${tab}|${page}`); } });
    return () => { alive = false; };
  }, [tab, page, isInitial]);
  const loading = !isInitial && loadedKey !== `${tab}|${page}`;

  const shown = isInitial ? initial : blockData;
  const press = shown.materials as PressMaterial[];
  const headlines = (shown.headlines as ArticleMaterial[]) ?? [];
  const totalPages = Number(shown.totalPages ?? 1);
  const lead = yonhap.materials[0];

  return (
    <section aria-label="뉴스스탠드" className="dv-card mt-4">
      <div className="flex items-center justify-between px-5 pt-4">
        <div role="tablist" aria-label="뉴스스탠드 탭" className="flex items-center gap-1 text-[15px]">
          {TABS.map((t, i) => (
            <span key={t} className="flex items-center">
              {i > 0 && <span className="mx-2 text-dv-border" aria-hidden>{i === 1 ? "·" : "/"}</span>}
              <button role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setPage(1); }} className={`font-bold ${tab === t ? "text-dv-green" : "text-dv-text-2"}`}>{t}</button>
            </span>
          ))}
        </div>
        <Link href="/newsstand" className="text-[13px] text-dv-text-2 border border-dv-border rounded px-2.5 py-1 hover:bg-dv-bg-2">전체언론사</Link>
      </div>

      {lead && (
        <div className="mx-5 mt-4 px-4 py-3 bg-dv-bg-3 rounded-lg flex items-center gap-3 text-[14px]">
          <b className="shrink-0">{lead.press_name} ▾</b>
          <span className="text-dv-border" aria-hidden>|</span>
          <span className="shrink-0 font-bold text-dv-red">속보</span>
          <Link href={`/news/article/${lead.id}`} data-clk="nsb_nsd.sn" className="flex-1 dv-ellipsis">{lead.title}</Link>
          <Link href="/newsstand" className="text-[13px] text-dv-text-3 shrink-0">뉴스스탠드</Link>
          <span className="text-dv-border" aria-hidden>|</span>
          <Link href="/news" className="text-[13px] text-dv-text-3 shrink-0">뉴스홈</Link>
        </div>
      )}

      <div className={`mx-5 mt-4 ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
        {tab === "뉴스스탠드" && view === "thumbnail" && (
          <ul className="grid grid-cols-6 border-l border-t border-dv-border">
            {press.map((p) => (
              <li key={p.id} className="border-r border-b border-dv-border h-[56px] flex items-center justify-center">
                <Link href={`/newsstand/${p.slug}`} data-clk="nsb_nch.press" className="px-2 text-[13px] font-extrabold tracking-tight text-center dv-ellipsis w-full" style={{ color: p.logo_color }} title={p.name}>
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {tab === "뉴스스탠드" && view === "list" && (
          <ul className="grid grid-cols-4 gap-x-4 gap-y-1 text-[13px]">
            {press.map((p) => (
              <li key={p.id} className="dv-ellipsis"><Link href={`/newsstand/${p.slug}`}><span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: p.logo_color }} aria-hidden />{p.name}</Link></li>
            ))}
          </ul>
        )}
        {tab !== "뉴스스탠드" && (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
            {headlines.map((a) => (
              <li key={a.id} className="flex gap-3 items-start">
                <Link href={`/news/article/${a.id}`} className="dv-thumb w-[96px] h-[64px] rounded-md shrink-0 text-[11px]" style={{ background: a.image_color }}>{a.press_name}</Link>
                <div className="min-w-0">
                  <Link href={`/news/article/${a.id}`} data-clk="fresh_block.press_edit.article_title" className="font-bold text-[14px] dv-clamp-2">{a.title}</Link>
                  <p className="text-[12px] text-dv-text-3 mt-1 dv-ellipsis">{a.press_name} · {a.section}</p>
                </div>
              </li>
            ))}
            {headlines.length === 0 && <li className="col-span-2 text-center text-dv-text-3 py-8">표시할 기사가 없습니다.</li>}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-4 mt-2 border-t border-dv-border-2">
        <div className="w-24" />
        <div className="flex items-center gap-3 text-[13px] text-dv-text-2">
          <button type="button" aria-label="이전 페이지" onClick={() => setPage((p) => (p > 1 ? p - 1 : totalPages))} className="w-8 h-8 rounded-full border border-dv-border grid place-items-center">‹</button>
          <span><b className="text-dv-green">{tab === "뉴스스탠드" ? "구독한" : tab}</b> 언론사 {page}/{totalPages}</span>
          <button type="button" aria-label="다음 페이지" onClick={() => setPage((p) => (p < totalPages ? p + 1 : 1))} className="w-8 h-8 rounded-full border border-dv-border grid place-items-center">›</button>
        </div>
        <div role="radiogroup" aria-label="보기 방식" className="flex items-center gap-1 w-24 justify-end">
          <button role="radio" aria-checked={view === "list"} aria-label="리스트형" onClick={() => setView("list")} className={`w-8 h-8 rounded grid place-items-center ${view === "list" ? "text-dv-green" : "text-dv-text-3"}`}>☰</button>
          <button role="radio" aria-checked={view === "thumbnail"} aria-label="썸네일형" onClick={() => setView("thumbnail")} className={`w-8 h-8 rounded grid place-items-center ${view === "thumbnail" ? "text-dv-green" : "text-dv-text-3"}`}>▦</button>
        </div>
      </div>
    </section>
  );
}
