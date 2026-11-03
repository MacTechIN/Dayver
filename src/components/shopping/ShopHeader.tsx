import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { cartCount } from "@/lib/shopping";
import { SearchBox } from "./SearchBox";
import { CategoryLayer } from "./CategoryLayer";

/** 쇼핑 헤더: 프로모션 로고 + 검색 + 우측 카테고리/마이쇼핑/장바구니 (shopping.naver.com/ns/home 헤더 재해석) */
export async function ShopHeader({ query }: { query?: string }) {
  const user = await getCurrentUser();
  const count = user ? cartCount(user.id) : 0;
  return (
    <header className="bg-white">
      <div className="dv-container flex items-center h-[88px] gap-8">
        <h1 className="shrink-0">
          <Link href="/shopping" aria-label="데이버플러스 스토어" className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white bg-dv-purple rounded px-1.5 py-0.5 leading-none">D+ 스토어</span>
            <span className="text-[30px] font-black tracking-tighter text-dv-purple italic">데이세일</span>
          </Link>
        </h1>
        <SearchBox initial={query} />
        <div className="ml-auto flex items-center gap-2">
          <CategoryLayer />
          <Link href="/shopping/my" className="flex flex-col items-center gap-1 w-16 text-[12px] text-dv-text-2 hover:text-dv-purple" data-clk="shop_gnb.myshopping">
            <span aria-hidden className="w-6 h-6 rounded-full border-2 border-current grid place-items-center text-[10px]">●</span>마이쇼핑
          </Link>
          <Link href="/shopping/cart" className="relative flex flex-col items-center gap-1 w-16 text-[12px] text-dv-text-2 hover:text-dv-purple" aria-label={`장바구니 ${count}개`} data-clk="shop_gnb.cart">
            <span aria-hidden className="w-6 h-6 border-2 border-current rounded-b-md rounded-t-sm" />
            장바구니
            {count > 0 && <span className="absolute top-0 right-3 min-w-4 h-4 px-1 rounded-full bg-dv-red text-white text-[10px] grid place-items-center">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
