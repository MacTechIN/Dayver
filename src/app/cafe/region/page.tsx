import type { Metadata } from "next";
import { SectionShell } from "@/components/cafe/SectionShell";
import { CafeCard } from "@/components/cafe/CafeCard";
import { PostRows } from "@/components/cafe/PostRows";
import { listCafesByRegion, listNeighborPosts } from "@/lib/cafe";

export const metadata: Metadata = { title: "지역별 카페 - DAYVER 카페" };

export default function RegionPage() {
  const cafes = listCafesByRegion();
  const groups = new Map<string, typeof cafes>();
  for (const c of cafes) {
    const k = c.region ?? "기타";
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  const posts = listNeighborPosts(10);
  return (
    <SectionShell current="/cafe/region">
      <h1 className="text-[20px] font-bold mb-1">이웃 · 지역별 카페 <span className="text-[11px] text-dv-red italic">Beta</span></h1>
      <p className="text-[13px] text-dv-text-3 mb-6">지역을 설정한 카페와 이웃 소식을 모았어요.</p>
      {[...groups.entries()].map(([region, list]) => (
        <section key={region} aria-label={`${region} 카페`} className="mb-8">
          <h2 className="text-[16px] font-bold mb-2">📍 {region} <span className="text-dv-text-3 text-[13px] font-normal">{list.length}개 카페</span></h2>
          <ul className="grid grid-cols-2 gap-x-6">
            {list.map((c) => <li key={c.id}><CafeCard cafe={c} clk="cafe_region.card" /></li>)}
          </ul>
        </section>
      ))}
      {groups.size === 0 && <p className="text-dv-text-3 py-8">지역을 설정한 카페가 아직 없습니다.</p>}
      <section aria-label="이웃 소식" className="mt-4">
        <h2 className="text-[16px] font-bold mb-2">이웃 소식</h2>
        <PostRows posts={posts} clk="cafe_region.post" />
      </section>
    </SectionShell>
  );
}
