"use client";

import Link from "next/link";
import { useState } from "react";

export type FrontPage = { pressName: string; pressSlug: string; color: string; title: string; articleId: number };

/** "오늘 1면" 종이 카드 캐러셀 (news.naver.com 관측 재해석) */
export function FrontPageCarousel({ pages }: { pages: FrontPage[] }) {
  const [idx, setIdx] = useState(0);
  const per = 2;
  const max = Math.max(0, pages.length - per);
  const visible = pages.slice(idx, idx + per);
  return (
    <section aria-label="오늘 1면" className="dv-card p-4">
      <h2 className="font-bold text-[15px] mb-3 flex items-center gap-1">오늘 1면 <span className="text-dv-text-3 text-[12px]" title="각 언론사의 1면 머리기사">ⓘ</span></h2>
      <div className="relative">
        <ul className="grid grid-cols-2 gap-3">
          {visible.map((p) => (
            <li key={p.pressSlug} className="border border-dv-border rounded-sm p-3 bg-white shadow-[2px_2px_0_#e3e5e8]">
              <Link href={`/newsstand/${p.pressSlug}`} className="block" data-clk="news_front.press">
                <b className="block text-[14px]" style={{ color: p.color }}>{p.pressName}</b>
                <hr className="my-2 border-dv-text" />
              </Link>
              <Link href={`/news/article/${p.articleId}`} className="dv-clamp-3 text-[13px] leading-snug" data-clk="news_front.title">{p.title}</Link>
              <Link href={`/newsstand/${p.pressSlug}`} className="block text-right text-[12px] text-dv-text-3 mt-3">지면보기 ›</Link>
            </li>
          ))}
        </ul>
        <button type="button" aria-label="이전" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - per))} className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-dv-border shadow disabled:opacity-30">‹</button>
        <button type="button" aria-label="다음" disabled={idx >= max} onClick={() => setIdx((i) => Math.min(max, i + per))} className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-dv-border shadow disabled:opacity-30">›</button>
      </div>
    </section>
  );
}
