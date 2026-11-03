"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Suggest = { cafes: Array<{ slug: string; name: string; member_count: number }>; posts: Array<{ id: number; cafe_slug: string; title: string; cafe_name: string }> };

/** 검색창: "원하는 카페, 글을 찾아보세요" + TIP + 자동완성 펼침 + 검색 (API /api/cafe/search 사용) */
export function CafeSearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(false);
  const [sug, setSug] = useState<Suggest | null>(null);
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open || q.trim().length < 1) return;
    const t = setTimeout(() => {
      fetch(`/api/cafe/search?q=${encodeURIComponent(q)}&limit=5`).then((r) => r.json()).then(setSug).catch(() => setSug(null));
    }, 150);
    return () => clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) { setOpen(false); setTip(false); } };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <form
      ref={box}
      role="search"
      className="relative"
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/cafe/search?q=${encodeURIComponent(q.trim())}`); setOpen(false); }}
    >
      <div className="flex items-center w-[340px] h-9 border border-dv-border rounded-full bg-dv-bg-3 pl-4 pr-1 focus-within:border-dv-green focus-within:bg-white">
        <input
          aria-label="원하는 카페, 글을 찾아보세요"
          placeholder="원하는 카페, 글을 찾아보세요"
          value={q}
          onChange={(e) => { const v = e.target.value; setQ(v); setOpen(true); if (v.trim().length < 1) setSug(null); }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent outline-none text-[13px] min-w-0"
        />
        <button type="button" aria-label="카페 검색 TIP" onClick={() => setTip((v) => !v)} className="w-5 h-5 rounded-full border border-dv-border text-[10px] text-dv-text-3 grid place-items-center mr-1">?</button>
        <button type="button" aria-label="자동완성 펼침" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="w-5 h-5 text-dv-text-3 text-[10px]">▼</button>
        <button type="submit" aria-label="검색" className="w-7 h-7 rounded-full grid place-items-center text-dv-green text-[16px]">🔍</button>
      </div>
      {tip && (
        <div className="absolute z-40 top-11 left-0 w-[340px] dv-card p-3 text-[12px] text-dv-text-2 shadow">
          <b className="block text-dv-text mb-1">검색 TIP</b>
          카페 이름, 주제, 글 제목으로 검색할 수 있어요. 예) <i>캠핑</i>, <i>러닝</i>, <i>영어</i>
        </div>
      )}
      {open && q.trim().length > 0 && sug && (sug.cafes.length > 0 || sug.posts.length > 0) && (
        <div role="listbox" className="absolute z-40 top-11 left-0 w-[340px] dv-card shadow text-[13px] overflow-hidden">
          {sug.cafes.length > 0 && (
            <div className="p-2 border-b border-dv-border-2">
              <div className="text-[11px] text-dv-text-3 px-2 pb-1">카페</div>
              {sug.cafes.map((c) => (
                <a key={c.slug} href={`/cafe/${c.slug}`} className="block px-2 py-1.5 rounded hover:bg-dv-bg-2 dv-ellipsis">
                  <b className="text-dv-green">{c.name}</b> <span className="text-dv-text-3">멤버 {c.member_count}</span>
                </a>
              ))}
            </div>
          )}
          {sug.posts.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] text-dv-text-3 px-2 pb-1">글</div>
              {sug.posts.map((p) => (
                <a key={p.id} href={`/cafe/${p.cafe_slug}/post/${p.id}`} className="block px-2 py-1.5 rounded hover:bg-dv-bg-2 dv-ellipsis">
                  {p.title} <span className="text-dv-text-3">· {p.cafe_name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
