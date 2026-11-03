import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/cafe/SectionShell";
import { searchCafePosts } from "@/lib/cafe";
import { PostRows } from "@/components/cafe/PostRows";

export const metadata: Metadata = { title: "마켓 - DAYVER 카페" };

/** 카페 마켓: 거래/장터/중고 관련 글 모음 (네이버 '플리마켓' 서브 브랜드 재해석) */
export default function MarketPage() {
  const posts = [...searchCafePosts("장터", 10), ...searchCafePosts("중고", 10), ...searchCafePosts("가격", 10)].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
  return (
    <SectionShell current="/cafe/market">
      <h1 className="text-[20px] font-bold mb-1"><span className="text-dv-purple">마켓</span> 우리 동네 거래</h1>
      <p className="text-[13px] text-dv-text-3 mb-6">카페 회원끼리 안전하게 거래하세요. 거래 글은 각 카페 게시판에 작성합니다.</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {["생활용품", "디지털", "취미/굿즈"].map((k, i) => (
          <Link key={k} href={`/cafe/search?q=${encodeURIComponent(k.split("/")[0])}`} className="dv-thumb h-[100px] rounded-xl text-[16px]" style={{ background: ["#5e3bee", "#0068c3", "#e8457b"][i] }}>{k}</Link>
        ))}
      </div>
      <PostRows posts={posts} clk="cafe_market.post" />
    </SectionShell>
  );
}
