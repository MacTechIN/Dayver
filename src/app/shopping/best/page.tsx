import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listBestProducts, listTopCategories, listWishIds, listProductsByCategory } from "@/lib/shopping";
import { ProductCard } from "@/components/shopping/ProductCard";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export const metadata: Metadata = { title: "베스트 - DAYVER 쇼핑" };

export default async function BestPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = String(sp.tab ?? "all");
  const catId = Number(sp.cat ?? 0) || 0;
  const tops = listTopCategories();
  const items = catId ? listProductsByCategory(catId, { sort: "popular", limit: 40 }).items : listBestProducts(40);
  const user = await getCurrentUser();
  const wishes = user ? listWishIds(user.id) : new Set<number>();
  const title = tab === "superpoint" ? "슈퍼적립" : tab === "live" ? "쇼핑 라이브" : "베스트";
  return (
    <div className="dv-container py-8">
      <h1 className="text-[24px] font-black">{title} <span className="text-[14px] font-normal text-dv-text-3 ml-2">리뷰 수 × 평점 기준 실시간 랭킹</span></h1>
      {tab === "superpoint" && <p className="mt-2 text-[13px] text-dv-green font-bold">거대한 할인 혜택에 10% 적립까지 — 멤버십 회원 대상</p>}
      {tab === "live" && <p className="mt-2 text-[13px] text-dv-red font-bold">● LIVE 방송 중인 상품을 랭킹순으로 보여드립니다</p>}
      <ul className="flex flex-wrap gap-2 mt-5" aria-label="카테고리">
        <li><Link href={`/shopping/best?tab=${tab}`} className={`px-3 py-1.5 rounded-full border text-[13px] ${!catId ? "bg-dv-text text-white border-dv-text" : "border-dv-border"}`}>전체</Link></li>
        {tops.map((c) => <li key={c.id}><Link href={`/shopping/best?tab=${tab}&cat=${c.id}`} className={`px-3 py-1.5 rounded-full border text-[13px] ${c.id === catId ? "bg-dv-text text-white border-dv-text" : "border-dv-border hover:border-dv-text"}`}>{c.name}</Link></li>)}
      </ul>
      <ol className="grid grid-cols-5 gap-x-4 gap-y-8 mt-8">
        {items.map((p, i) => (
          <li key={p.id} className="relative">
            <span className="absolute left-0 top-0 z-10 w-8 h-8 bg-dv-text text-white font-black grid place-items-center rounded-br-lg rounded-tl-xl" aria-label={`${i + 1}위`}>{i + 1}</span>
            <ProductCard product={p} wished={wishes.has(p.id)} back={`/shopping/best?tab=${tab}&cat=${catId}`} />
          </li>
        ))}
      </ol>
    </div>
  );
}
