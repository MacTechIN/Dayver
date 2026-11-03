import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";
import { CAFE_SERVICE_COLOR } from "./constants";
import { CafeSearchBox } from "./CafeSearchBox";

/**
 * 카페 섹션 헤더 (section.cafe 관측 재해석):
 * 로고 "D Cafe" + "마켓" 서브 브랜드, 검색창(TIP, 자동완성 펼침, 검색), 우측 로그인/서비스 더보기,
 * 그 아래 전체 폭 파란 프로모션 띠.
 */
export function CafeHeader({ promo = true }: { promo?: boolean }) {
  return (
    <header role="banner">
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="Cafe" serviceHref="/cafe" serviceColor={CAFE_SERVICE_COLOR}>
        <Link href="/cafe/market" className="ml-1 font-extrabold text-[15px] text-dv-purple" data-clk="cafe_gnb.market">마켓</Link>
        <div className="ml-6">
          <CafeSearchBox />
        </div>
      </TopBar>
      {promo && (
        <div className="bg-[#1b5cff] text-white">
          <div className="dv-container h-12 flex items-center justify-center gap-3 text-[15px]">
            <span>우리 동네 중고거래, 카페 마켓에서</span>
            <Link href="/cafe/market" className="font-extrabold inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1" data-clk="cafe_promo.market">
              <span className="w-5 h-5 rounded-full bg-white text-[#1b5cff] grid place-items-center text-[12px] font-black">D</span> 마켓 →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
