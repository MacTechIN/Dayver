"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CatNode = { id: number; name: string; vertical_code: string | null; children: Array<{ id: number; name: string }> };

/** 카테고리 버튼 + 레이어. 열 때 /api/shopping/categories 를 한 번 받아 localStorage 처럼 메모리에 유지. */
export function CategoryLayer() {
  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState<CatNode[] | null>(null);
  const [cur, setCur] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || tree) return;
    fetch("/api/shopping/categories").then((r) => r.json()).then((j) => setTree(j.categories ?? [])).catch(() => setTree([]));
  }, [open, tree]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex flex-col items-center gap-1 w-16 text-[12px] text-dv-text-2 hover:text-dv-purple">
        <span aria-hidden className="grid grid-cols-2 gap-[3px]">{[0, 1, 2, 3].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-sm border-2 border-current" />)}</span>
        카테고리
      </button>
      {open && (
        <div role="dialog" aria-label="카테고리 전체" className="absolute left-0 top-14 z-40 w-[760px] dv-card shadow-xl flex text-[13px]">
          <ul className="w-[200px] max-h-[520px] overflow-auto border-r border-dv-border py-2" role="tablist" aria-orientation="vertical">
            {(tree ?? []).map((t, i) => (
              <li key={t.id}>
                <button type="button" role="tab" aria-selected={i === cur} onMouseEnter={() => setCur(i)} onFocus={() => setCur(i)} className={`w-full text-left px-4 py-2 ${i === cur ? "bg-dv-purple/10 text-dv-purple font-bold" : "hover:bg-dv-bg-3"}`}>
                  {t.name}
                </button>
              </li>
            ))}
            {!tree && <li className="px-4 py-3 text-dv-text-3">불러오는 중…</li>}
          </ul>
          <div className="flex-1 p-5">
            {tree && tree[cur] && (
              <>
                <h3 className="font-bold text-[15px] mb-3">
                  <Link href={`/shopping/category/${tree[cur].id}`} onClick={() => setOpen(false)}>{tree[cur].name} 전체보기 ›</Link>
                </h3>
                <ul className="grid grid-cols-3 gap-x-4 gap-y-2">
                  {tree[cur].children.map((c) => (
                    <li key={c.id}><Link href={`/shopping/category/${c.id}`} onClick={() => setOpen(false)} className="hover:text-dv-purple hover:underline">{c.name}</Link></li>
                  ))}
                </ul>
                {tree[cur].vertical_code && (
                  <p className="mt-5 pt-4 border-t border-dv-border-2 text-dv-text-3">전문관: <span className="text-dv-purple font-bold">{tree[cur].vertical_code}</span></p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
