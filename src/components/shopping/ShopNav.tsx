"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const SHOP_TABS = [
  { name: "홈", href: "/shopping" },
  { name: "오늘끝딜", href: "/shopping/deals" },
  { name: "데이N마트", href: "/shopping/category/106" },
  { name: "베스트", href: "/shopping/best" },
  { name: "슈퍼적립", href: "/shopping/best?tab=superpoint" },
  { name: "쇼핑 라이브", href: "/shopping/best?tab=live", external: true },
  { name: "지금배달", href: "/shopping/category/107" },
  { name: "선물샵", href: "/shopping/category/126" },
  { name: "패션타운", href: "/shopping/category/101" },
  { name: "N배송", href: "/shopping/category/118" },
  { name: "푸드윈도", href: "/shopping/category/106" },
  { name: "하이엔드", href: "/shopping/category/114" },
  { name: "노크잇", href: "/shopping/category/102", badge: "New" },
  { name: "기획전", href: "/shopping/deals" },
];

/** 버티컬 탭 내비게이션 (관측된 홈·오늘끝딜·…·기획전 14개 탭 재해석) */
export function ShopNav() {
  const path = usePathname();
  return (
    <nav aria-label="쇼핑 서비스" className="border-b border-dv-border bg-white">
      <ul className="dv-container flex items-center gap-6 h-12 text-[15px]">
        {SHOP_TABS.map((t) => {
          const base = t.href.split("?")[0];
          const selected = path === base && (t.name !== "슈퍼적립" && t.name !== "쇼핑 라이브");
          return (
            <li key={t.name} className="relative h-full flex items-center">
              <Link
                href={t.href}
                aria-current={selected ? "page" : undefined}
                className={`font-bold h-full flex items-center border-b-2 ${selected ? "text-dv-purple border-dv-purple" : "border-transparent hover:text-dv-purple"}`}
                data-clk={`shop_gnb.tab.${t.name}`}
              >
                {t.name}
                {t.badge && <sup className="ml-0.5 text-[10px] text-dv-red font-bold">{t.badge}</sup>}
                {t.external && <span className="ml-0.5 text-[11px] text-dv-text-3" aria-label="새 창">↗</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
