"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * 메인 검색창 (네이버 #search / #autoFrame 재해석).
 * 입력 100ms 디바운스 후 /api/search/ac 호출, 방향키/Enter 로 선택, Enter 로 /search 이동.
 */
export function SearchBox({ initial = "", compact = false }: { initial?: string; compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<Array<[string, string]>>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [kbd, setKbd] = useState(false);
  const listId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) return;
    timer.current = setTimeout(async () => {
      abort.current?.abort();
      const ac = new AbortController();
      abort.current = ac;
      try {
        const r = await fetch(`/api/search/ac?q=${encodeURIComponent(q)}`, { signal: ac.signal });
        const j = (await r.json()) as { items: Array<[string, string]> };
        setItems(j.items);
        setOpen(true);
        setActive(-1);
      } catch { /* aborted */ }
    }, 100);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q]);

  const go = (query: string) => {
    const v = query.trim();
    if (!v) return;
    setOpen(false);
    router.push(`/search?where=nexearch&sm=top_hty&query=${encodeURIComponent(v)}`);
  };

  return (
    <div id="search" role="search" className={`relative ${compact ? "w-[560px]" : "w-[708px]"}`}>
      <form
        id="sform"
        onSubmit={(e) => { e.preventDefault(); go(active >= 0 && items[active] ? items[active][0] : q); }}
        className={`flex items-center bg-white border-2 border-dv-green rounded-full shadow-[0_2px_8px_rgba(3,199,90,0.12)] ${compact ? "h-11 pl-4 pr-1.5" : "h-[60px] pl-5 pr-2"}`}
        role="group"
        aria-label="검색"
      >
        <span className="font-black text-dv-green text-[22px] mr-3 select-none" aria-hidden>D</span>
        <label htmlFor="query" className="sr-only">검색어를 입력해 주세요.</label>
        <input
          id="query"
          name="query"
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={q}
          onChange={(e) => { setQ(e.target.value); if (!e.target.value.trim()) { setItems([]); setOpen(false); } }}
          onFocus={() => items.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!open || items.length === 0) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
            else if (e.key === "Escape") setOpen(false);
          }}
          placeholder="검색어를 입력해 주세요."
          className="flex-1 h-full outline-none text-[18px] placeholder:text-dv-text-3"
        />
        <button type="button" aria-label="입력도구" aria-pressed={kbd} onClick={() => setKbd((v) => !v)} className={`w-9 h-9 rounded-full grid place-items-center text-dv-text-3 hover:bg-dv-bg-2 ${kbd ? "text-dv-green" : ""}`}>⌨</button>
        <button type="submit" aria-label="AI 검색" className="ml-1 h-9 px-4 rounded-full bg-dv-bg-2 text-dv-blue font-bold text-[14px] flex items-center gap-1 hover:bg-[#e6f4ff]">
          <span aria-hidden>✦</span> AI
        </button>
      </form>
      {open && items.length > 0 && (
        <div id="autoFrame" className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-dv-border rounded-2xl shadow-lg z-40 overflow-hidden">
          <ul id={listId} role="listbox" className="py-2">
            {items.map(([k, src], i) => (
              <li
                key={k}
                role="option"
                aria-selected={i === active}
                onMouseDown={() => go(k)}
                onMouseEnter={() => setActive(i)}
                className={`px-5 py-2 flex items-center gap-3 cursor-pointer ${i === active ? "bg-dv-bg-2" : ""}`}
              >
                <span className="text-dv-green" aria-hidden>⌕</span>
                <span className="flex-1 dv-ellipsis">{highlight(k, q)}</span>
                <span className="text-[12px] text-dv-text-3">{src}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between px-5 py-2 border-t border-dv-border-2 text-[12px] text-dv-text-3 bg-dv-bg-3">
            <span>관심사를 반영한 컨텍스트 자동완성</span>
            <button type="button" onMouseDown={() => setOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

function highlight(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0 || !q) return text;
  return (
    <>
      {text.slice(0, i)}<mark className="bg-transparent text-dv-green font-bold">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}
    </>
  );
}
