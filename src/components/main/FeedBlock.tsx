"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Block, FeedMaterial } from "@/lib/main";

const TABS = ["추천", "카테크", "웹툰", "패션뷰티", "리빙푸드", "책방", "지식", "건강"];

/**
 * 추천 관심사 블록 (네이버 PC-FEED-WRAPPER 재해석).
 * 탭 클릭 → GET /api/lazy?blockCodeList=PC-FEED-WRAPPER&target=PC-FEED-<탭>
 */
export function FeedBlock({ initial }: { initial: Block<FeedMaterial> }) {
  const [tab, setTab] = useState<string>(String(initial.tab ?? "추천"));
  const [data, setData] = useState<Block<FeedMaterial>>(initial);
  const [expanded, setExpanded] = useState(false);
  const [loadedTab, setLoadedTab] = useState(String(initial.tab ?? "추천"));

  useEffect(() => {
    if (tab === String(initial.tab)) return;
    let alive = true;
    fetch(`/api/lazy?blockCodeList=PC-FEED-WRAPPER&target=${encodeURIComponent("PC-FEED-" + tab)}`)
      .then((r) => r.json())
      .then((j) => { if (alive) { setData(j["PC-FEED-WRAPPER"].blocks[0]); setLoadedTab(tab); } });
    return () => { alive = false; };
  }, [tab, initial]);
  const loading = tab !== String(initial.tab) && loadedTab !== tab;

  const shown = tab === String(initial.tab) ? initial : data;
  const items = expanded ? shown.materials : shown.materials.slice(0, 8);
  return (
    <section aria-label="추천 관심사" className="dv-card mt-4">
      <div className="flex items-center justify-between px-5 pt-4">
        <div role="tablist" className="flex items-center gap-1 text-[15px] overflow-hidden">
          {TABS.map((t, i) => (
            <span key={t} className="flex items-center">
              {i > 0 && <span className="mx-2 text-dv-border" aria-hidden>/</span>}
              <button role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setExpanded(false); }} className={`font-bold ${tab === t ? "text-dv-green" : "text-dv-text-2"}`}>{t}</button>
            </span>
          ))}
        </div>
        <Link href="/blog/neighbors" className="text-[13px] text-dv-text-2 border border-dv-border rounded px-2.5 py-1 hover:bg-dv-bg-2">구독홈</Link>
      </div>
      <ul className={`grid grid-cols-4 gap-x-4 gap-y-6 p-5 ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
        {items.map((f) => (
          <li key={f.id}>
            <Link href={f.link} data-clk={`feed.${tab}.item`} className="block">
              <div className="relative dv-thumb aspect-[4/3] rounded-lg text-[12px]" style={{ background: f.image_color }}>
                {f.source}
                {f.kind === "video" && <span className="absolute left-2 bottom-2 text-[11px] bg-black/60 rounded px-1.5 py-0.5"><span className="sr-only">재생시간 </span>▶ {f.duration}</span>}
              </div>
              <p className="mt-2 text-[14px] font-bold dv-clamp-2">{f.title}</p>
              <p className="text-[12px] text-dv-text-3 mt-1 dv-ellipsis">{f.source}</p>
            </Link>
          </li>
        ))}
      </ul>
      {shown.materials.length > 8 && (
        <div className="px-5 pb-4 text-center">
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)} className="text-[13px] text-dv-text-2 border border-dv-border rounded px-4 py-1.5 hover:bg-dv-bg-2">{expanded ? "접기" : "펼쳐보기"}</button>
        </div>
      )}
    </section>
  );
}
