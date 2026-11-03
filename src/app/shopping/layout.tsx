import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";
import { ShopHeader } from "@/components/shopping/ShopHeader";
import { ShopNav } from "@/components/shopping/ShopNav";
import { ShopFooter } from "@/components/shopping/ShopFooter";
import { TopButton } from "@/components/shopping/TopButton";

export const metadata: Metadata = { title: "데이버플러스 스토어 - DAYVER 쇼핑" };

export default function ShoppingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <a href="#content" className="dv-skip">본문으로 바로가기</a>
      <TopBar service="쇼핑" serviceHref="/shopping" serviceColor="#5e3bee">
        <Link href="/shopping/my" className="text-[13px] text-dv-text-2 ml-2" data-clk="shop_gnb.pay">
          <span className="inline-block w-4 h-4 rounded-full bg-dv-green text-white text-[10px] font-black text-center leading-4 mr-1" aria-hidden>D</span>데이버페이
        </Link>
      </TopBar>
      <ShopHeader />
      <ShopNav />
      <main id="content">{children}</main>
      <ShopFooter />
      <TopButton />
    </div>
  );
}
