import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listWishProducts } from "@/lib/shopping";
import { ProductCard } from "@/components/shopping/ProductCard";

export const metadata: Metadata = { title: "찜한 상품 - DAYVER 쇼핑" };

export default async function WishPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/shopping/wish");
  const items = listWishProducts(user.id);
  return (
    <div className="dv-container py-8">
      <h1 className="text-[24px] font-black">찜한 상품 <span className="text-dv-purple">{items.length}</span></h1>
      {items.length === 0 ? (
        <p className="py-24 text-center text-dv-text-3">찜한 상품이 없습니다. 마음에 드는 상품의 ♡를 눌러보세요.</p>
      ) : (
        <ul className="grid grid-cols-5 gap-x-4 gap-y-8 mt-6">
          {items.map((p) => <li key={p.id}><ProductCard product={p} wished back="/shopping/wish" /></li>)}
        </ul>
      )}
    </div>
  );
}
