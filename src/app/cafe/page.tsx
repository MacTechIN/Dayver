import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/cafe/SectionShell";
import { PostCards, PostRows } from "@/components/cafe/PostRows";
import { CafeCard } from "@/components/cafe/CafeCard";
import { CAFE_CATEGORIES } from "@/components/cafe/constants";
import { listNeighborPosts, listPopularCafesByCategory, listPopularPosts, listRepresentativeCafes } from "@/lib/cafe";

export const metadata: Metadata = { title: "DAYVER 카페" };

export default async function CafeHomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" && CAFE_CATEGORIES.includes(sp.cat) ? sp.cat : CAFE_CATEGORIES[0];
  const popular = listPopularPosts(8);
  const neighbors = listNeighborPosts(4);
  const region = neighbors[0]?.region ?? "우리 동네";
  const catCafes = listPopularCafesByCategory(cat, 6);
  const reps = listRepresentativeCafes(4);
  return (
    <SectionShell current="/cafe">
      <h1 className="text-[20px] font-bold mb-6">카페홈</h1>

      <section aria-label="인기글" className="mb-10">
        <h2 className="flex items-center justify-between text-[18px] font-bold mb-4">
          <span>🔥 인기글 <span className="text-[12px] font-normal text-dv-text-3 ml-1">최근 7일 기준</span></span>
          <Link href="/cafe/popular" className="text-[13px] font-normal text-dv-text-2" data-clk="cafe_home.popular.more">더보기 ›</Link>
        </h2>
        <PostCards posts={popular.slice(0, 3)} />
        <div className="mt-2">
          <PostRows posts={popular.slice(3, 8)} />
        </div>
      </section>

      <section aria-label={`${region} 이웃 소식`} className="mb-10">
        <h2 className="flex items-center justify-between text-[18px] font-bold mb-2">
          <button type="button" className="inline-flex items-center gap-1">{region} 이웃 소식 <span className="text-[12px] text-dv-text-3">▾</span></button>
          <Link href="/cafe/region" className="text-[13px] font-normal text-dv-text-2" data-clk="cafe_home.neighbor.more">더보기 ›</Link>
        </h2>
        <ul className="divide-y divide-dv-border-2">
          {neighbors.map((p) => (
            <li key={p.id} className="py-3.5">
              <Link href={`/cafe/${p.cafe_slug}/post/${p.id}`} data-clk="cafe_home.neighbor.title" className="block text-[15px] dv-ellipsis">
                <span className="text-dv-green font-bold mr-1">카페</span>{p.title}
              </Link>
              <p className="text-[12px] text-dv-text-3 mt-1">{p.cafe_name} · ♡ {p.likes} · 💬 {p.comment_count}</p>
            </li>
          ))}
          {neighbors.length === 0 && <li className="py-6 text-dv-text-3">이웃 소식이 아직 없습니다.</li>}
        </ul>
      </section>

      <section aria-label="주제별 인기 카페" className="mb-10">
        <h2 className="text-[18px] font-bold mb-3">주제별 인기 카페</h2>
        <ul className="flex flex-wrap gap-2 mb-4" role="tablist">
          {CAFE_CATEGORIES.map((c) => (
            <li key={c} role="presentation">
              <Link
                href={`/cafe?cat=${encodeURIComponent(c)}#content`}
                role="tab"
                aria-selected={c === cat}
                data-clk="cafe_home.category.chip"
                className={`inline-block px-3 py-1.5 rounded-full border text-[13px] ${c === cat ? "bg-dv-text text-white border-dv-text font-bold" : "border-dv-border text-dv-text-2 hover:bg-dv-bg-2"}`}
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="grid grid-cols-2 gap-x-6">
          {catCafes.map((c) => <li key={c.id}><CafeCard cafe={c} clk="cafe_home.category.card" /></li>)}
          {catCafes.length === 0 && <li className="text-dv-text-3 py-6">아직 이 주제의 카페가 없어요. <Link href="/cafe/create" className="text-dv-green font-bold">첫 카페를 만들어 보세요</Link></li>}
        </ul>
        <div className="text-right mt-2"><Link href={`/cafe/category/${encodeURIComponent(cat)}`} className="text-[13px] text-dv-text-2">{cat} 카페 전체보기 ›</Link></div>
      </section>

      <section aria-label="대표 카페" className="mb-6">
        <h2 className="flex items-center justify-between text-[18px] font-bold mb-3">
          <span>대표 카페</span>
          <Link href="/cafe/ranking" className="text-[13px] font-normal text-dv-text-2">카페 랭킹 ›</Link>
        </h2>
        <ul className="grid grid-cols-2 gap-x-6">
          {reps.map((c) => <li key={c.id}><CafeCard cafe={c} clk="cafe_home.rep.card" /></li>)}
        </ul>
      </section>
    </SectionShell>
  );
}
