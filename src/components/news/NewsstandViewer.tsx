"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type StandPress = {
  id: number;
  name: string;
  slug: string;
  color: string;
  subscribed: boolean;
  articles: Array<{ id: number; title: string; summary: string; image_color: string; created_at: string }>;
};

/**
 * 뉴스스탠드 뷰어 (newsstand.naver.com 재해석):
 * 가운데 큰 언론사 카드 + 좌우 흐린 카드, 이전/다음, 자동넘김(15초) 토글, 하단 로고 스트립.
 */
export function NewsstandViewer({ presses, initial = 0 }: { presses: StandPress[]; initial?: number }) {
  const [idx, setIdx] = useState(Math.min(initial, Math.max(0, presses.length - 1)));
  const [auto, setAuto] = useState(true);
  const n = presses.length;
  useEffect(() => {
    if (!auto || n <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 15000);
    return () => clearInterval(t);
  }, [auto, n]);
  if (n === 0) return <p className="text-center py-20 text-dv-text-3">표시할 언론사가 없습니다.</p>;
  const cur = presses[idx];
  const prev = presses[(idx - 1 + n) % n];
  const next = presses[(idx + 1) % n];
  const [lead, ...rest] = cur.articles;

  return (
    <div>
      <div className="relative flex items-stretch justify-center gap-4 py-6">
        <SideCard p={prev} side="left" onClick={() => setIdx((idx - 1 + n) % n)} />
        <section aria-label={`${cur.name} 주요뉴스`} className="w-[890px] bg-white border border-dv-border shadow-lg p-6 rounded-sm">
          <header className="flex items-center justify-between border-b-2 border-dv-text pb-3 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[26px] font-black" style={{ color: cur.color }}>{cur.name}</h2>
              <span className="text-[12px] text-dv-text-3">{lead ? lead.created_at.slice(5, 16).replace(" ", " ") : ""}</span>
            </div>
            <div className="flex items-center gap-1 text-[12px]">
              <Link href={`/newsstand/${cur.slug}`} className="px-2 py-1 border border-dv-border rounded" data-clk="newsstand.view">{cur.subscribed ? "✓ 구독중" : "구독하기"}</Link>
              <button type="button" className="px-2 py-1 border border-dv-border rounded">이용자 한마디</button>
              <button type="button" className="px-2 py-1 border border-dv-border rounded" aria-label="소셜보내기">↗</button>
            </div>
          </header>
          {lead && (
            <div className="grid grid-cols-[1.2fr_1fr] gap-5">
              <Link href={`/news/article/${lead.id}`} className="block" data-clk="newsstand.lead">
                <div className="dv-thumb rounded h-56 mb-3" style={{ background: lead.image_color }}>{cur.name} 1면</div>
                <strong className="text-[18px] leading-snug dv-clamp-2">{lead.title}</strong>
                <p className="text-[13px] text-dv-text-2 dv-clamp-2 mt-1">{lead.summary}</p>
              </Link>
              <ul className="divide-y divide-dv-border-2">
                {rest.map((a) => (
                  <li key={a.id} className="py-2.5">
                    <Link href={`/news/article/${a.id}`} className="dv-clamp-2 text-[14px] hover:underline" data-clk="newsstand.title">{a.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <footer className="text-right mt-4 text-[12px]">
            <Link href={`/news/press/${cur.slug}`} className="text-dv-blue">{cur.name} 사이트 바로가기 ›</Link>
          </footer>
        </section>
        <SideCard p={next} side="right" onClick={() => setIdx((idx + 1) % n)} />
        <button type="button" aria-label="이전" onClick={() => setIdx((idx - 1 + n) % n)} className="absolute left-[120px] top-1/2 -translate-y-1/2 text-5xl text-dv-text-3 hover:text-dv-text">‹</button>
        <button type="button" aria-label="다음" onClick={() => setIdx((idx + 1) % n)} className="absolute right-[120px] top-1/2 -translate-y-1/2 text-5xl text-dv-text-3 hover:text-dv-text">›</button>
      </div>
      <div className="w-[890px] mx-auto flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">자동넘김</h3>
          <button type="button" aria-pressed={auto} onClick={() => setAuto((v) => !v)} className="px-2 py-1 border border-dv-border rounded bg-white">
            현재 설정 : {auto ? "빠르게(15초)" : "정지"} ▾
          </button>
        </div>
        <div className="flex items-center gap-2">
          <b>{idx + 1}</b> / {n}
          <button type="button" aria-label="이전" onClick={() => setIdx((idx - 1 + n) % n)} className="w-6 h-6 border border-dv-border bg-white rounded">‹</button>
          <button type="button" aria-label="다음" onClick={() => setIdx((idx + 1) % n)} className="w-6 h-6 border border-dv-border bg-white rounded">›</button>
        </div>
      </div>
      <section aria-label="언론사 목록" className="mt-8 bg-[#2b2b2b] py-4">
        <ul className="dv-container flex gap-2 overflow-x-auto">
          {presses.map((p, i) => (
            <li key={p.id} className="shrink-0">
              <button type="button" onClick={() => setIdx(i)} aria-current={i === idx} className={`w-[86px] h-[62px] bg-white rounded-sm border-2 flex flex-col items-center justify-center gap-1 ${i === idx ? "border-dv-green" : "border-transparent"}`} data-clk="newsstand.strip">
                <span className="w-5 h-5 rounded-full" style={{ background: p.color }} aria-hidden />
                <span className="text-[11px] font-bold dv-ellipsis w-full text-center px-1">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SideCard({ p, side, onClick }: { p: StandPress; side: "left" | "right"; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${p.name} 보기`} className={`w-[140px] bg-white/80 border border-dv-border rounded-sm p-3 text-left opacity-70 hover:opacity-100 ${side === "left" ? "rounded-r-none" : "rounded-l-none"}`}>
      <b className="block text-[16px] dv-ellipsis" style={{ color: p.color }}>{p.name}</b>
      <div className="mt-3 space-y-2">
        {p.articles.slice(0, 3).map((a) => (
          <div key={a.id} className="dv-thumb h-10 rounded text-[10px]" style={{ background: a.image_color }} />
        ))}
      </div>
    </button>
  );
}
