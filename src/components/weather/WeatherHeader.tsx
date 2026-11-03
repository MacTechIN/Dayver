import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";

/** 날씨 서비스 헤더: 공통 상단바 + 서브 내비 */
export function WeatherHeader({ active = "home" }: { active?: "home" | "compare" }) {
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="날씨" serviceHref="/weather" serviceColor="#0068c3" />
      <nav aria-label="날씨 메뉴" className="bg-white border-b border-dv-border">
        <ul className="dv-container flex gap-6 text-[14px]">
          <li><Link href="/weather" data-clk="weather.gnb.home" className={`block py-3 border-b-2 ${active === "home" ? "border-dv-blue text-dv-blue font-bold" : "border-transparent text-dv-text-2"}`}>오늘 날씨</Link></li>
          <li><Link href="/weather/compare" data-clk="weather.gnb.compare" className={`block py-3 border-b-2 ${active === "compare" ? "border-dv-blue text-dv-blue font-bold" : "border-transparent text-dv-text-2"}`}>예보 비교</Link></li>
          <li><Link href="/news/section/life" className="block py-3 border-b-2 border-transparent text-dv-text-2">날씨 뉴스</Link></li>
        </ul>
      </nav>
    </>
  );
}
