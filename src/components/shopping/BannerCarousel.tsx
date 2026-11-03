"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type BannerSlide = {
  id: number; title: string; subtitle: string; label: string; color: string; landing_url: string;
  products: Array<{ id: number; name: string; image_color: string }>;
};

function Slide({ s, main }: { s: BannerSlide; main?: boolean }) {
  return (
    <Link
      href={s.landing_url}
      className={`relative shrink-0 rounded-2xl overflow-hidden text-white ${main ? "w-[540px]" : "w-[340px] opacity-90"} h-[260px] flex`}
      style={{ background: `linear-gradient(135deg, ${s.color}, #1b1340)` }}
      aria-label={`${s.title} ${s.subtitle}`}
      data-clk="shop_home.banner"
    >
      <div className="p-7 flex flex-col justify-center flex-1">
        <span className="inline-block w-fit text-[11px] font-black bg-white/90 text-dv-purple rounded px-1.5 py-0.5 mb-3">{s.label}</span>
        <strong className={`${main ? "text-[26px]" : "text-[20px]"} leading-tight font-black dv-clamp-2`}>{s.title}</strong>
        <span className="mt-2 text-[14px] opacity-90 dv-clamp-2">{s.subtitle}</span>
      </div>
      {main && (
        <ul className="flex flex-col justify-center gap-2 pr-6" aria-label="대표 상품">
          {s.products.map((p) => (
            <li key={p.id} className="w-[110px] h-[110px] rounded-xl dv-thumb text-[11px]" style={{ background: p.image_color }}>{p.name.replace(/^\[[^\]]+\]\s*/, "").slice(0, 18)}</li>
          ))}
        </ul>
      )}
    </Link>
  );
}

/** 메인 배너 캐러셀: 이전/다음/자동 재생 정지, 가운데 슬라이드 강조 (관측된 네이버 쇼핑 홈 배너 재해석) */
export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(true);
  const n = slides.length;
  useEffect(() => {
    if (!playing || n < 2) return;
    const t = setInterval(() => setCur((c) => (c + 1) % n), 4000);
    return () => clearInterval(t);
  }, [playing, n]);
  if (n === 0) return null;
  const at = (k: number) => slides[((cur + k) % n + n) % n];
  return (
    <section aria-roledescription="carousel" aria-label="메인 배너" className="relative">
      <div className="flex justify-center gap-4 overflow-hidden">
        <Slide s={at(-1)} />
        <Slide s={at(0)} main />
        <Slide s={at(1)} />
      </div>
      <div className="dv-container flex items-center gap-3 mt-4">
        <ul className="flex-1 flex gap-1" aria-hidden>
          {slides.map((s, i) => <li key={s.id} className={`h-[3px] flex-1 rounded ${i === cur ? "bg-dv-text" : "bg-dv-border"}`} />)}
        </ul>
        <span className="text-[13px] text-dv-text-2"><b>{cur + 1}</b> / {n}</span>
        <button type="button" aria-label="이전" onClick={() => setCur((c) => (c - 1 + n) % n)} className="w-8 h-8 rounded-full border border-dv-border grid place-items-center">‹</button>
        <button type="button" aria-label="다음" onClick={() => setCur((c) => (c + 1) % n)} className="w-8 h-8 rounded-full border border-dv-border grid place-items-center">›</button>
        <button type="button" aria-label={playing ? "자동 재생 정지" : "자동 재생"} aria-pressed={!playing} onClick={() => setPlaying((p) => !p)} className="w-8 h-8 rounded-full border border-dv-border grid place-items-center text-[12px]">{playing ? "❚❚" : "▶"}</button>
      </div>
    </section>
  );
}
