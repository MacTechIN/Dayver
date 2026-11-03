"use client";

import Link from "next/link";
import { useState } from "react";
import { Thumb } from "./ProductCardClient";

type P = { id: number; name: string; image_color: string; price: number; discount_rate: number; tag_title: string | null };
type Store = { id: number; slug: string; name: string; description: string; color: string; products: P[] };

/** AI 스토어 큐레이션: 테마 제목, 툴팁, 다른 추천 보기(테마 순환), 스토어 펼치기 버튼, 선택 스토어 상품 그리드 */
export function StoreCuration({ title, categoryName, stores, seed }: { title: string; categoryName: string; stores: Store[]; seed: number }) {
  const [cur, setCur] = useState(0);
  const [tip, setTip] = useState(false);
  const store = stores[cur];
  return (
    <section aria-label="AI 스토어 큐레이션" className="dv-container mt-14">
      <div className="flex items-center gap-2">
        <h2 className="text-[22px] font-black"><span className="text-dv-purple">{categoryName}</span> {title.replace(`${categoryName}, `, "")}</h2>
        <button type="button" aria-label="Ai 생성 툴팁 보기" onClick={() => setTip((t) => !t)} className="w-5 h-5 rounded-full border border-dv-text-3 text-[11px] text-dv-text-3">i</button>
        {tip && <span role="tooltip" className="text-[12px] text-dv-text-2 bg-dv-bg-2 rounded px-2 py-1">리뷰·판매량·관심 데이터를 바탕으로 자동 구성한 추천입니다.</span>}
        <Link href={`/shopping?curation=${seed + 1}`} className="ml-auto text-[13px] text-dv-text-2 border border-dv-border rounded-full px-3 py-1.5 hover:border-dv-purple hover:text-dv-purple" data-clk="shop_home.curation.next">다른 추천 보기 ↻</Link>
      </div>
      <ul className="flex gap-2 mt-4" role="tablist">
        {stores.map((s, i) => (
          <li key={s.id}>
            <button type="button" role="tab" aria-selected={i === cur} aria-label={`${s.name} 스토어 펼치기`} onClick={() => setCur(i)} className={`px-4 py-2 rounded-full border text-[13px] font-bold ${i === cur ? "bg-dv-text text-white border-dv-text" : "border-dv-border hover:border-dv-text"}`}>
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle" style={{ background: s.color }} aria-hidden />{s.name}
            </button>
          </li>
        ))}
      </ul>
      {store && (
        <div className="mt-4 dv-card p-5">
          <p className="text-[13px] text-dv-text-2 mb-4">{store.description}</p>
          <ul className="grid grid-cols-4 gap-4">
            {store.products.map((p) => (
              <li key={p.id}>
                <Link href={`/shopping/product/${p.id}`} className="block" data-clk="shop_home.curation.product">
                  <Thumb name={p.name} color={p.image_color} className="aspect-square" />
                  <p className="mt-2 text-[13px] dv-clamp-2">{p.name.replace(/^\[[^\]]+\]\s*/, "")}</p>
                  <p className="mt-1">{p.discount_rate > 0 && <span className="text-dv-red font-bold mr-1">{Math.round(p.discount_rate)}%</span>}<b>{p.price.toLocaleString("ko-KR")}</b>원</p>
                  {p.tag_title && <span className="text-[11px] text-dv-purple">{p.tag_title}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/shopping/store/${store.slug}`} className="inline-block mt-4 text-[13px] font-bold text-dv-purple">스토어홈 바로가기 ›</Link>
        </div>
      )}
    </section>
  );
}
