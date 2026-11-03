import type { Metadata } from "next";
import { SectionShell } from "@/components/cafe/SectionShell";
import { CafeCard } from "@/components/cafe/CafeCard";
import { PostRows } from "@/components/cafe/PostRows";
import { searchCafePosts, searchCafes } from "@/lib/cafe";

export const metadata: Metadata = { title: "카페 검색 - DAYVER 카페" };

export default async function CafeSearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cafes = q ? searchCafes(q, 20) : [];
  const posts = q ? searchCafePosts(q, 30) : [];
  return (
    <SectionShell current="/cafe/search" promo={false}>
      <h1 className="text-[20px] font-bold mb-6">&lsquo;{q}&rsquo; 검색 결과</h1>
      <section aria-label="카페" className="mb-8">
        <h2 className="text-[16px] font-bold mb-2">카페 <span className="text-dv-text-3 text-[13px] font-normal">{cafes.length}</span></h2>
        <ul className="grid grid-cols-2 gap-x-6">{cafes.map((c) => <li key={c.id}><CafeCard cafe={c} clk="cafe_search.cafe" /></li>)}</ul>
        {cafes.length === 0 && <p className="text-dv-text-3 py-4">일치하는 카페가 없습니다.</p>}
      </section>
      <section aria-label="글">
        <h2 className="text-[16px] font-bold mb-2">글 <span className="text-dv-text-3 text-[13px] font-normal">{posts.length}</span></h2>
        <PostRows posts={posts} clk="cafe_search.post" />
      </section>
    </SectionShell>
  );
}
