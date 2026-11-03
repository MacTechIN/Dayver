"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICES } from "@/components/common/ServiceMenu";

/** 주요 서비스 바로가기 (네이버 #shortcutArea 재해석): 아이콘 10개 + "바로가기 펼침" */
const EXTRA = [
  { code: "me", name: "MY", href: "/me", color: "#555", icon: "MY" },
  { code: "search", name: "통합검색", href: "/search", color: "#03c75a", icon: "Q" },
  { code: "cafe-create", name: "카페 만들기", href: "/cafe/create", color: "#2db400", icon: "+" },
  { code: "blog-write", name: "글쓰기", href: "/blog/write", color: "#1ec800", icon: "W" },
  { code: "mail-write", name: "메일쓰기", href: "/mail/write", color: "#03c75a", icon: "M" },
  { code: "cart", name: "장바구니", href: "/shopping/cart", color: "#5e3bee", icon: "S" },
];

export function Shortcuts() {
  const [open, setOpen] = useState(false);
  const main = SERVICES.filter((s) => !["search", "me"].includes(s.code));
  return (
    <nav id="shortcutArea" aria-label="주요 서비스" className="mt-5">
      <ul className="flex items-start justify-center gap-[14px]">
        {main.map((s) => (
          <li key={s.code}>
            <Link href={s.href} data-clk={`service_shortcut.service.${s.code}`} className="flex flex-col items-center gap-1.5 w-[54px]">
              <span className="w-10 h-10 rounded-[14px] grid place-items-center text-white text-[13px] font-black shadow-sm" style={{ background: s.color }} aria-hidden>{s.icon}</span>
              <span className="text-[13px] text-dv-text-2">{s.name}</span>
            </Link>
          </li>
        ))}
        <li>
          <button type="button" aria-expanded={open} aria-label={open ? "바로가기 접기" : "바로가기 펼침"} onClick={() => setOpen((v) => !v)} className="flex flex-col items-center gap-1.5 w-[54px]">
            <span className="w-10 h-10 rounded-[14px] grid place-items-center bg-white border border-dv-border text-dv-text-3 text-xl" aria-hidden>···</span>
            <span className="text-[13px] text-dv-text-3">{open ? "접기" : "더보기"}</span>
          </button>
        </li>
      </ul>
      {open && (
        <ul className="flex justify-center gap-[14px] mt-3 pt-3 border-t border-dv-border-2">
          {EXTRA.map((s) => (
            <li key={s.code}>
              <Link href={s.href} data-clk={`service_shortcut.more.${s.code}`} className="flex flex-col items-center gap-1.5 w-[54px]">
                <span className="w-10 h-10 rounded-[14px] grid place-items-center text-white text-[13px] font-black" style={{ background: s.color }} aria-hidden>{s.icon}</span>
                <span className="text-[13px] text-dv-text-2 text-center leading-tight">{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
