"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Kw = { keywordName: string; keywordTag: string };

/** 쇼핑 검색창: 입력 중 /api/shopping/auto-complete 호출(관측된 gnb/auto-complete 재해석), Enter 시 /shopping/search 이동 */
export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [list, setList] = useState<Kw[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) return;
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/shopping/auto-complete?keyword=${encodeURIComponent(q)}&personalizeYn=n`);
        const j = await res.json();
        setList(j.result?.keywordList ?? []);
        setOpen(true);
      } catch { setList([]); }
    }, 100);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (kw: string) => {
    setOpen(false);
    if (kw.trim()) router.push(`/shopping/search?query=${encodeURIComponent(kw.trim())}`);
  };

  return (
    <form
      ref={box}
      role="search"
      className="relative w-[500px]"
      onSubmit={(e) => { e.preventDefault(); go(active >= 0 && list[active] ? list[active].keywordName : q); }}
    >
      <div className="flex items-center h-11 border-2 border-dv-purple rounded-md bg-white pl-4 pr-1">
        <label htmlFor="shop-search" className="sr-only">검색어 입력</label>
        <input
          id="shop-search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(-1); if (!e.target.value.trim()) setList([]); }}
          onFocus={() => list.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="찾고 싶은 상품을 검색해보세요"
          autoComplete="off"
          className="flex-1 outline-none text-[15px] bg-transparent"
          aria-autocomplete="list"
        />
        <button type="button" aria-label="검색레이어 펼치기" onClick={() => setOpen((v) => !v)} className="w-8 h-8 grid place-items-center text-dv-text-3">▾</button>
        <span className="w-px h-6 bg-dv-border mx-1" aria-hidden />
        <button type="submit" aria-label="검색" className="w-9 h-9 grid place-items-center text-dv-purple text-xl">⌕</button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-12 z-40 dv-card shadow-lg py-2 text-[14px]">
          {list.length === 0 ? (
            <div className="px-4 py-3 text-dv-text-3">최근 검색어가 없습니다.</div>
          ) : (
            <ul role="listbox">
              {list.map((k, i) => (
                <li key={k.keywordName + i} role="option" aria-selected={i === active}>
                  <button type="button" onMouseDown={() => go(k.keywordName)} className={`w-full text-left px-4 py-2 flex items-center gap-2 ${i === active ? "bg-dv-bg-2" : "hover:bg-dv-bg-3"}`}>
                    <span className="text-dv-text-3" aria-hidden>⌕</span>
                    <span className="flex-1 dv-ellipsis">{k.keywordName}</span>
                    {k.keywordTag === "03" && <span className="text-[11px] text-dv-purple border border-dv-purple/40 rounded px-1">카테고리</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
