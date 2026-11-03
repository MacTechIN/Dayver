import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SORTS, getCategory, listChildCategories, listProductsByCategory, listWishIds, type Sort } from "@/lib/shopping";
import { ProductCard } from "@/components/shopping/ProductCard";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const SORT_LABEL: Record<Sort, string> = { popular: "인기순", recent: "최신순", price_asc: "낮은 가격순", price_desc: "높은 가격순", review: "리뷰 좋은순" };
const PAGE = 40;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategory(Number((await params).id));
  return { title: `${cat?.name ?? "카테고리"} - DAYVER 쇼핑` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const sp = await searchParams;
  const cat = getCategory(id);
  if (!cat) notFound();
  const sort = (SORTS as readonly string[]).includes(String(sp.sort)) ? (String(sp.sort) as Sort) : "popular";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const parent = cat.parent_id ? getCategory(cat.parent_id) : null;
  const siblings = listChildCategories(cat.parent_id ?? cat.id);
  const { items, total } = listProductsByCategory(id, { sort, limit: PAGE, offset: (page - 1) * PAGE });
  const user = await getCurrentUser();
  const wishes = user ? listWishIds(user.id) : new Set<number>();
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const back = `/shopping/category/${id}?sort=${sort}&page=${page}`;

  return (
    <div className="dv-container py-8">
      <nav aria-label="현재 위치" className="text-[13px] text-dv-text-3 mb-3">
        <Link href="/shopping">홈</Link> › {parent ? <><Link href={`/shopping/category/${parent.id}`}>{parent.name}</Link> › </> : null}<b className="text-dv-text">{cat.name}</b>
      </nav>
      <h1 className="text-[26px] font-black">{cat.name} <span className="text-[15px] font-normal text-dv-text-3 ml-2">{total.toLocaleString()}개 상품</span></h1>
      {cat.vertical_code && (
        <p className="mt-2 text-[13px]"><span className="text-dv-purple font-bold">전문관</span> <Link href={`/shopping/category/${cat.parent_id ?? cat.id}`} className="underline">{cat.vertical_code}</Link></p>
      )}
      <ul className="flex flex-wrap gap-2 mt-5" aria-label="하위 카테고리">
        <li><Link href={`/shopping/category/${cat.parent_id ?? cat.id}`} className={`px-3 py-1.5 rounded-full border text-[13px] ${!cat.parent_id ? "bg-dv-text text-white border-dv-text" : "border-dv-border"}`}>전체</Link></li>
        {siblings.map((s) => (
          <li key={s.id}><Link href={`/shopping/category/${s.id}`} className={`px-3 py-1.5 rounded-full border text-[13px] ${s.id === id ? "bg-dv-text text-white border-dv-text" : "border-dv-border hover:border-dv-text"}`}>{s.name}</Link></li>
        ))}
      </ul>
      <div className="flex items-center justify-between mt-8 border-b border-dv-border pb-3">
        <ul className="flex gap-4 text-[13px]" aria-label="정렬">
          {SORTS.map((s) => (
            <li key={s}><Link href={`/shopping/category/${id}?sort=${s}`} aria-current={s === sort ? "true" : undefined} className={s === sort ? "font-bold text-dv-text" : "text-dv-text-3"}>{SORT_LABEL[s]}</Link></li>
          ))}
        </ul>
        <span className="text-[13px] text-dv-text-3">{page} / {pages} 페이지</span>
      </div>
      {items.length === 0 ? (
        <p className="py-20 text-center text-dv-text-3">상품이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-5 gap-x-4 gap-y-8 mt-6">
          {items.map((p) => <li key={p.id}><ProductCard product={p} wished={wishes.has(p.id)} back={back} /></li>)}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-label="페이지" className="flex justify-center gap-2 mt-10 text-[13px]">
          {Array.from({ length: pages }).map((_, i) => (
            <Link key={i} href={`/shopping/category/${id}?sort=${sort}&page=${i + 1}`} aria-current={i + 1 === page ? "page" : undefined} className={`w-8 h-8 grid place-items-center rounded ${i + 1 === page ? "bg-dv-text text-white" : "border border-dv-border"}`}>{i + 1}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
