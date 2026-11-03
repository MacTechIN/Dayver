"use client";

import Link from "next/link";
import { useState } from "react";
import type { Place, PlaceReview } from "@/lib/map";

const CURRENT = { x: 500, y: 520 };
const CAT_ICON: Record<string, string> = { 음식점: "R", 카페: "C", 편의점: "S", 병원: "H", 주차장: "P", 관광명소: "T", 은행: "B", 약국: "M" };
const distanceText = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);

/**
 * 지도 화면 (네이버 지도 PC 재해석): 좌측 검색/결과 패널 + 우측 SVG 지도 캔버스.
 * 핀 클릭 → 상세 패널, 길찾기 → 현위치에서 장소까지 경로 폴리라인.
 */
export function MapView({ places, initialSelected, reviews, query, category }: { places: Place[]; initialSelected?: Place; reviews?: PlaceReview[]; query?: string; category?: string }) {
  const [selected, setSelected] = useState<Place | null>(initialSelected ?? null);
  const [zoom, setZoom] = useState(1);
  const [route, setRoute] = useState(false);
  const size = 1000;
  const view = size / zoom;
  const cx = selected ? selected.x : CURRENT.x;
  const cy = selected ? selected.y : CURRENT.y;
  const vx = Math.max(0, Math.min(size - view, cx - view / 2));
  const vy = Math.max(0, Math.min(size - view, cy - view / 2));
  const pick = (p: Place) => { setSelected(p); setRoute(false); };
  const CATS = ["음식점", "카페", "편의점", "병원", "주차장"];

  return (
    <div className="grid grid-cols-[390px_1fr] h-[calc(100vh-48px)] min-h-[640px]">
      <aside className="border-r border-dv-border flex flex-col bg-white overflow-hidden">
        <form action="/map/search" method="get" role="search" className="p-3 border-b border-dv-border">
          <div className="flex items-center border-2 border-dv-green rounded-md overflow-hidden">
            <label htmlFor="map-q" className="sr-only">장소, 주소 검색</label>
            <input id="map-q" name="query" defaultValue={query ?? ""} placeholder="장소, 주소 검색" className="flex-1 px-3 py-2.5 outline-none text-[14px]" />
            <button type="submit" aria-label="검색" className="px-3 text-dv-green font-bold">⌕</button>
          </div>
          <ul className="flex gap-1.5 mt-2.5 text-[12px]">
            {CATS.map((c) => (
              <li key={c}><Link href={`/map/search?category=${encodeURIComponent(c)}`} data-clk={`map.category.${c}`} className={`px-2.5 py-1 rounded-full border ${category === c ? "bg-dv-green text-white border-dv-green" : "border-dv-border text-dv-text-2 hover:bg-dv-bg-2"}`}>{c}</Link></li>
            ))}
          </ul>
        </form>
        {selected ? (
          <section aria-label="장소 상세" className="flex-1 overflow-y-auto">
            <div className="h-28 dv-thumb text-[18px]" style={{ background: selected.color }}>{selected.name}</div>
            <div className="p-4">
              <button type="button" onClick={() => setSelected(null)} className="text-[12px] text-dv-text-3 mb-2">‹ 목록으로</button>
              <h2 className="text-[20px] font-black">{selected.name} <span className="text-[13px] text-dv-text-3 font-normal">{selected.category}</span></h2>
              <p className="text-[13px] mt-1"><span className="text-dv-red font-bold">★ {selected.rating}</span> <span className="text-dv-text-3">리뷰 {selected.review_count} · {distanceText(selected.distance ?? 0)}</span></p>
              <dl className="text-[13px] mt-3 space-y-1.5">
                <div className="flex gap-2"><dt className="w-12 text-dv-text-3">주소</dt><dd>{selected.address}</dd></div>
                <div className="flex gap-2"><dt className="w-12 text-dv-text-3">전화</dt><dd>{selected.phone}</dd></div>
                <div className="flex gap-2"><dt className="w-12 text-dv-text-3">영업</dt><dd>{selected.hours}</dd></div>
              </dl>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setRoute((v) => !v)} aria-pressed={route} data-clk="map.place.route" className={`flex-1 py-2 rounded-md font-bold text-[13px] ${route ? "bg-dv-green text-white" : "border border-dv-green text-dv-green"}`}>{route ? "길찾기 표시 중" : "길찾기"}</button>
                <Link href={`/map/place/${selected.id}`} className="flex-1 py-2 rounded-md border border-dv-border text-center text-[13px]">상세 페이지</Link>
              </div>
              {route && <p className="text-[12px] text-dv-text-2 mt-2 bg-dv-bg-3 rounded p-2">현위치에서 도보 약 {Math.max(1, Math.round((selected.distance ?? 0) / 70))}분 · {distanceText(selected.distance ?? 0)}</p>}
              <p className="text-[13px] text-dv-text-2 mt-4">{selected.description}</p>
              {reviews && reviews.length > 0 && (
                <section aria-label="리뷰" className="mt-4">
                  <h3 className="font-bold text-[14px] mb-2">리뷰 {reviews.length}</h3>
                  <ul className="divide-y divide-dv-border-2 text-[13px]">{reviews.map((r) => <li key={r.id} className="py-2"><b>{r.author}</b> <span className="text-dv-red">★ {r.score}</span><p className="text-dv-text-2">{r.content}</p></li>)}</ul>
                </section>
              )}
            </div>
          </section>
        ) : (
          <section aria-label="검색 결과" className="flex-1 overflow-y-auto">
            <p className="px-4 py-2 text-[12px] text-dv-text-3 border-b border-dv-border-2">{query ? `'${query}' 검색 결과` : category ? `${category} 주변` : "주변 추천 장소"} {places.length}곳 · 현위치 기준 거리순</p>
            <ul className="divide-y divide-dv-border-2">
              {places.map((p, i) => (
                <li key={p.id}>
                  <button type="button" onClick={() => pick(p)} data-clk="map.result.item" className="w-full text-left p-4 hover:bg-dv-bg-3 flex gap-3">
                    <span className="w-6 h-6 rounded-full grid place-items-center text-white text-[11px] font-bold shrink-0" style={{ background: p.color }} aria-hidden>{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[14px]">{p.name} <span className="text-[12px] text-dv-text-3 font-normal">{p.category}</span></b>
                      <span className="block text-[12px] text-dv-text-2 dv-ellipsis">{p.address}</span>
                      <span className="block text-[12px]"><span className="text-dv-red font-bold">★ {p.rating}</span> <span className="text-dv-text-3">리뷰 {p.review_count} · {distanceText(p.distance ?? 0)} · {p.hours}</span></span>
                    </span>
                  </button>
                </li>
              ))}
              {places.length === 0 && <li className="p-8 text-center text-dv-text-3 text-[13px]">검색 결과가 없습니다.</li>}
            </ul>
          </section>
        )}
      </aside>
      <div className="relative bg-[#eef1e6] overflow-hidden">
        <svg viewBox={`${vx} ${vy} ${view} ${view}`} className="w-full h-full" role="img" aria-label={`지도. 장소 ${places.length}곳 표시${selected ? `, ${selected.name} 선택됨` : ""}`}>
          <defs>
            <pattern id="blocks" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#eef1e6" />
              <rect x="8" y="8" width="84" height="84" rx="6" fill="#e3e8d8" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={size} height={size} fill="url(#blocks)" />
          {/* 도로 */}
          {[100, 300, 500, 700, 900].map((v) => <g key={v}><rect x="0" y={v - 10} width={size} height="20" fill="#fff" /><rect x={v - 10} y="0" width="20" height={size} fill="#fff" /></g>)}
          <rect x="0" y="490" width={size} height="22" fill="#ffe9a8" /><rect x="490" y="0" width="22" height={size} fill="#ffe9a8" />
          {/* 공원/수역 */}
          <rect x="620" y="120" width="220" height="150" rx="20" fill="#cfe8c4" /><text x="730" y="200" fontSize="14" textAnchor="middle" fill="#4a7a3a">하루공원</text>
          <path d="M0,820 C200,760 400,880 600,820 S900,760 1000,800 L1000,1000 L0,1000 Z" fill="#bcd8f2" /><text x="880" y="900" fontSize="14" fill="#2c5f8a">나루강</text>
          {/* 경로 */}
          {route && selected && <polyline points={`${CURRENT.x},${CURRENT.y} ${selected.x},${CURRENT.y} ${selected.x},${selected.y}`} fill="none" stroke="#03c75a" strokeWidth="6" strokeDasharray="12 8" strokeLinecap="round" />}
          {/* 핀 */}
          {places.map((p, i) => {
            const on = selected?.id === p.id;
            return (
              <g key={p.id} onClick={() => pick(p)} style={{ cursor: "pointer" }} role="button" aria-label={`${p.name} 핀`} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") pick(p); }}>
                <circle cx={p.x} cy={p.y} r={on ? 18 : 12} fill={on ? "#03c75a" : p.color} stroke="#fff" strokeWidth="3" />
                <text x={p.x} y={p.y + 4} fontSize={on ? 13 : 10} textAnchor="middle" fill="#fff" fontWeight="700">{on ? CAT_ICON[p.category] ?? "•" : i + 1}</text>
                {(on || zoom >= 2) && <text x={p.x} y={p.y - 22} fontSize="13" textAnchor="middle" fill="#222" fontWeight="700" stroke="#fff" strokeWidth="3" paintOrder="stroke">{p.name}</text>}
              </g>
            );
          })}
          {/* 현위치 */}
          <circle cx={CURRENT.x} cy={CURRENT.y} r="26" fill="#0068c3" opacity="0.15" /><circle cx={CURRENT.x} cy={CURRENT.y} r="8" fill="#0068c3" stroke="#fff" strokeWidth="3" />
        </svg>
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button type="button" aria-label="확대" onClick={() => setZoom((z) => Math.min(4, z * 1.5))} className="w-10 h-10 bg-white rounded-md shadow text-[18px] font-bold">+</button>
          <button type="button" aria-label="축소" onClick={() => setZoom((z) => Math.max(1, z / 1.5))} className="w-10 h-10 bg-white rounded-md shadow text-[18px] font-bold">−</button>
          <button type="button" aria-label="현위치" onClick={() => { setSelected(null); setZoom(2); }} className="w-10 h-10 bg-white rounded-md shadow text-dv-blue font-bold">◎</button>
        </div>
        <div className="absolute left-4 bottom-4 bg-white/90 rounded px-3 py-1.5 text-[12px] text-dv-text-2">데이버시 하루구 · 축척 1:{Math.round(5000 / zoom)} · 가상 지도</div>
      </div>
    </div>
  );
}
