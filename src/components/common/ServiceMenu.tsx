"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Dayver 서비스 목록. 메인 바로가기와 "서비스 더보기" 레이어에서 공유. */
export const SERVICES = [
  { code: "mail", name: "메일", href: "/mail", color: "#03c75a", icon: "M" },
  { code: "cafe", name: "카페", href: "/cafe", color: "#2db400", icon: "C" },
  { code: "blog", name: "블로그", href: "/blog", color: "#1ec800", icon: "B" },
  { code: "shopping", name: "쇼핑", href: "/shopping", color: "#5e3bee", icon: "S" },
  { code: "news", name: "뉴스", href: "/news", color: "#0068c3", icon: "N" },
  { code: "newsstand", name: "뉴스스탠드", href: "/newsstand", color: "#3b5998", icon: "NS" },
  { code: "weather", name: "날씨", href: "/weather", color: "#2bb3b1", icon: "W" },
  { code: "stock", name: "증권", href: "/stock", color: "#c0392b", icon: "$" },
  { code: "map", name: "지도", href: "/map", color: "#1f8a70", icon: "지" },
  { code: "search", name: "통합검색", href: "/search", color: "#03c75a", icon: "Q" },
  { code: "me", name: "MY", href: "/me", color: "#555", icon: "MY" },
];

export function ServiceMenu({ dark }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="서비스 더보기"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 rounded grid place-items-center text-lg ${dark ? "hover:bg-white/10" : "hover:bg-dv-bg-2"}`}
      >
        <span aria-hidden className="grid grid-cols-3 gap-[2px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className={`w-[3px] h-[3px] rounded-sm ${dark ? "bg-white" : "bg-dv-text-2"}`} />
          ))}
        </span>
      </button>
      {open && (
        <div role="dialog" aria-label="전체 서비스" className="absolute right-0 top-10 z-50 w-72 dv-card shadow-lg p-3 text-dv-text">
          <div className="text-[12px] font-bold text-dv-text-3 px-1 pb-2">전체 서비스</div>
          <ul className="grid grid-cols-4 gap-1">
            {SERVICES.map((s) => (
              <li key={s.code}>
                <Link href={s.href} onClick={() => setOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded hover:bg-dv-bg-2 text-[12px]">
                  <span className="w-9 h-9 rounded-xl grid place-items-center text-white text-[12px] font-black" style={{ background: s.color }} aria-hidden>{s.icon}</span>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
