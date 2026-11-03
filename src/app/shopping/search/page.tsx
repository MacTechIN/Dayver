import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SORTS, countSearch, listWishIds, relatedKeywords, searchProducts, type Sort } from "@/lib/shopping";
import { ProductCard } from "@/components/shopping/ProductCard";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const SORT_LABEL: Record<Sort, string> = { popular: "인기순", recent: "최신순", price_asc: "낮은 가격순", price_desc: "높은 가격순", review: "리뷰 좋은순" };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = String((await searchParams).query ?? "");
  return { title: `${q} : DAYVER 쇼핑 검색` };
}

export default async function ShopSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = String(sp.query ?? "").trim();
  const sort = (SORTS as readonly string[]).includes(String(sp.sort)) ? (String(sp.sort) as Sort) : "popular";
  const items = q ? searchProducts(q, { limit: 60, sort }) : [];
  const total = q ? countSearch(q) : 0;
  const related = relatedKeywords(q);
  const user = await getCurrentUser();
  const wishes = user ? listWishIds(user.id) : new Set<number>();
  const back = `/shopping/search?query=${encodeURIComponent(q)}&sort=${sort}`;
  return (
    <div className="dv-container py-8">
      <h1 className="text-[22px] font-black">&lsquo;{q}&rsquo; <span className="font-normal text-dv-text-2 text-[16px]">검색결과 {total.toLocaleString()}건</span></h1>
      {related.length > 0 && (
        <section aria-label="연관 검색어" className="mt-4 flex items-center gap-2 text-[13px] flex-wrap">
          <span className="text-dv-text-3 mr-1">연관</span>
          {related.map((k) => <Link key={k} href={`/shopping/search?query=${encodeURIComponent(k)}`} className="px-3 py-1 rounded-full bg-dv-bg-2 hover:bg-dv-border">{k}</Link>)}
        </section>
      )}
      <div className="flex items-center justify-between mt-8 border-b border-dv-border pb-3">
        <ul className="flex gap-4 text-[13px]" aria-label="정렬">
          {SORTS.map((s) => (
            <li key={s}><Link href={`/shopping/search?query=${encodeURIComponent(q)}&sort=${s}`} className={s === sort ? "font-bold" : "text-dv-text-3"}>{SORT_LABEL[s]}</Link></li>
          ))}
        </ul>
      </div>
      {items.length === 0 ? (
        <div className="py-24 text-center text-dv-text-3">
          <p className="text-[16px]">&lsquo;{q}&rsquo;에 대한 검색결과가 없습니다.</p>
          <p className="mt-2 text-[13px]">단어의 철자가 정확한지 확인해 보세요. 카테고리에서 상품을 찾아보셔도 좋아요.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-5 gap-x-4 gap-y-8 mt-6">
          {items.map((p) => <li key={p.id}><ProductCard product={p} wished={wishes.has(p.id)} back={back} /></li>)}
        </ul>
      )}
    </div>
  );
}
