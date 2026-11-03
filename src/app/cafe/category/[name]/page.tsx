import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/cafe/SectionShell";
import { CafeCard } from "@/components/cafe/CafeCard";
import { CAFE_CATEGORIES } from "@/components/cafe/constants";
import { listCafesByCategory, listCategoriesWithCounts } from "@/lib/cafe";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return { title: `${decodeURIComponent(name)} 카페 - DAYVER 카페` };
}

export default async function CategoryPage({ params }: Props) {
  const name = decodeURIComponent((await params).name);
  const counts = new Map(listCategoriesWithCounts().map((c) => [c.category, c.cnt]));
  const cafes = listCafesByCategory(name, 50);
  return (
    <SectionShell current="/cafe/category/생활">
      <h1 className="text-[20px] font-bold mb-4">주제별 카페</h1>
      <ul className="flex flex-wrap gap-2 mb-6" role="tablist">
        {CAFE_CATEGORIES.map((c) => (
          <li key={c} role="presentation">
            <Link href={`/cafe/category/${encodeURIComponent(c)}`} role="tab" aria-selected={c === name} className={`inline-block px-3 py-1.5 rounded-full border text-[13px] ${c === name ? "bg-dv-text text-white border-dv-text font-bold" : "border-dv-border text-dv-text-2 hover:bg-dv-bg-2"}`}>
              {c} <span className="opacity-60">{counts.get(c) ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="text-[16px] font-bold mb-2">{name} <span className="text-dv-text-3 font-normal text-[13px]">{cafes.length}개</span></h2>
      <ul className="divide-y divide-dv-border-2">
        {cafes.map((c) => <li key={c.id}><CafeCard cafe={c} clk="cafe_category.card" /></li>)}
        {cafes.length === 0 && <li className="py-10 text-center text-dv-text-3">아직 카페가 없습니다. <Link href="/cafe/create" className="text-dv-green font-bold">카페 만들기</Link></li>}
      </ul>
    </SectionShell>
  );
}
