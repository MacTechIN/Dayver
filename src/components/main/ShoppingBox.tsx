"use client";

import Link from "next/link";
import { useState } from "react";
import type { Block, ProductMaterial } from "@/lib/main";

const TABS = ["데이버플러스", "스토어", "데이세일", "쇼핑라이브"];

/** 쇼핑 블록 (네이버 메인 '쇼핑' region의 shoppingbox iframe 재해석): 좌측 스토어 목록 + 우측 상품 카드 2열 */
export function ShoppingBox({ block }: { block: Block<ProductMaterial> }) {
  const [tab, setTab] = useState(0);
  const stores = (block.stores as Array<{ id: number; name: string; slug: string }>) ?? [];
  const products = block.materials;
  const half = Math.ceil(products.length / 2);
  const groups = [
    { title: "요즘 뜨는 신상", items: products.slice(0, half) },
    { title: "오늘의 특가", items: products.slice(half) },
  ];
  return (
    <section aria-label="쇼핑" className="dv-card mt-4">
      <div className="flex items-center justify-between px-5 pt-4">
        <div role="tablist" className="flex items-center gap-1 text-[15px]">
          {TABS.map((t, i) => (
            <span key={t} className="flex items-center">
              {i > 0 && <span className="mx-2 text-dv-border" aria-hidden>/</span>}
              <button role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={`font-bold ${tab === i ? "text-dv-purple" : "text-dv-text-2"}`}>{t}</button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[13px] text-dv-text-2">
          <span>{tab + 1}/{TABS.length}</span>
          <button aria-label="이전" onClick={() => setTab((t) => (t + TABS.length - 1) % TABS.length)} className="w-7 h-7 rounded-full border border-dv-border">‹</button>
          <button aria-label="다음" onClick={() => setTab((t) => (t + 1) % TABS.length)} className="w-7 h-7 rounded-full border border-dv-border">›</button>
        </div>
      </div>
      <div className="grid grid-cols-[170px_1fr_1fr] gap-4 p-5">
        <aside className="bg-dv-bg-3 rounded-lg p-4">
          <ul className="grid grid-cols-2 gap-y-2 text-[13px] text-dv-text-2">
            {stores.slice(0, 10).map((s) => (
              <li key={s.id} className="dv-ellipsis"><Link href={`/shopping/store/${s.slug}`} data-clk="shopping_box.store">{s.name}</Link></li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-dv-border-2 text-[12px] text-dv-text-3 flex justify-between">
            <Link href="/shopping/best">인기 상품</Link>
            <Link href="/shopping/deals">오늘끝딜</Link>
          </div>
          <Link href="/shopping" className="mt-4 block text-center py-2 rounded-md bg-dv-purple text-white font-bold text-[13px]">쇼핑 홈</Link>
        </aside>
        {groups.map((g, gi) => (
          <div key={g.title}>
            <h3 className="bg-dv-bg-3 rounded-md px-3 py-2 text-[13px] font-bold"><span className="text-dv-purple">#</span> {g.title} <span className="text-dv-text-3 font-normal ml-1">{gi === 0 ? "신상품" : "특가"}</span></h3>
            <ul className="grid grid-cols-2 gap-3 mt-3">
              {g.items.map((p) => (
                <li key={p.id}>
                  <Link href={`/shopping/product/${p.id}`} data-clk="shopping_box.product" className="block">
                    <div className="dv-thumb aspect-square rounded-lg text-[12px]" style={{ background: p.image_color }}>{p.channel_name}</div>
                    <p className="mt-2 text-[13px] dv-clamp-2">{p.name}</p>
                    <p className="text-[13px] mt-0.5">
                      {p.discount_rate > 0 && <b className="text-dv-red mr-1">{Math.round(p.discount_rate)}%</b>}
                      <b>{p.sale_price.toLocaleString()}</b>원
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
