import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChannel, listProductsByChannel, listWishIds } from "@/lib/shopping";
import { ProductCard } from "@/components/shopping/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ch = getChannel((await params).slug);
  return { title: `${ch?.name ?? "스토어"} - DAYVER 쇼핑` };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const ch = getChannel(slug);
  if (!ch) notFound();
  const products = listProductsByChannel(ch.id);
  const user = await getCurrentUser();
  const wishes = user ? listWishIds(user.id) : new Set<number>();
  return (
    <div>
      <section aria-label="스토어 정보" className="py-10" style={{ background: `linear-gradient(90deg, ${ch.color}22, #fff)` }}>
        <div className="dv-container flex items-center gap-5">
          <span className="w-20 h-20 rounded-2xl grid place-items-center text-white text-3xl font-black" style={{ background: ch.color }} aria-hidden>{ch.name.slice(0, 1)}</span>
          <div>
            <p className="text-[12px] font-bold text-dv-purple">{ch.service_type === "BRAND" ? "브랜드 공식몰" : "스마트스토어"}</p>
            <h1 className="text-[26px] font-black">{ch.name}</h1>
            <p className="text-[13px] text-dv-text-2 mt-1">{ch.description} · dayver.com/{ch.slug}</p>
          </div>
          <button type="button" className="ml-auto px-5 py-2.5 rounded-full bg-dv-text text-white font-bold text-[13px]">+ 스토어찜</button>
        </div>
      </section>
      <div className="dv-container py-8">
        <h2 className="font-bold text-[18px] mb-5">전체상품 {products.length}</h2>
        <ul className="grid grid-cols-5 gap-x-4 gap-y-8">
          {products.map((p) => <li key={p.id}><ProductCard product={p} wished={wishes.has(p.id)} back={`/shopping/store/${slug}`} /></li>)}
        </ul>
      </div>
    </div>
  );
}
