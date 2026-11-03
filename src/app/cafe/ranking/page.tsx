import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/cafe/SectionShell";
import { CafeCard } from "@/components/cafe/CafeCard";
import { listRankedCafes, listRepresentativeCafes } from "@/lib/cafe";

export const metadata: Metadata = { title: "카페 랭킹 - DAYVER 카페" };

export default async function RankingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const tab = sp.tab === "rep" ? "rep" : "rank";
  const cafes = tab === "rep" ? listRepresentativeCafes(30) : listRankedCafes(50);
  return (
    <SectionShell current="/cafe/ranking">
      <h1 className="text-[20px] font-bold mb-4">카페 랭킹</h1>
      <div role="tablist" className="flex border-b border-dv-border mb-4 text-[14px]">
        <Link href="/cafe/ranking" role="tab" aria-selected={tab === "rank"} className={`px-4 py-2.5 -mb-px border-b-2 ${tab === "rank" ? "border-dv-text font-bold" : "border-transparent text-dv-text-3"}`}>전체 랭킹</Link>
        <Link href="/cafe/ranking?tab=rep" role="tab" aria-selected={tab === "rep"} className={`px-4 py-2.5 -mb-px border-b-2 ${tab === "rep" ? "border-dv-text font-bold" : "border-transparent text-dv-text-3"}`}>대표 카페</Link>
      </div>
      <p className="text-[12px] text-dv-text-3 mb-2">{tab === "rank" ? "멤버 수와 글 수를 기준으로 집계합니다." : "활동이 활발한 공개 카페를 대표 카페로 선정합니다."}</p>
      <ol className="divide-y divide-dv-border-2">
        {cafes.map((c, i) => <li key={c.id}><CafeCard cafe={c} rank={i + 1} clk="cafe_ranking.card" /></li>)}
      </ol>
    </SectionShell>
  );
}
