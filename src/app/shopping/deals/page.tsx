import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { discountedPrice, listDeals, listTodayEvents, listWishIds, won } from "@/lib/shopping";
import { Countdown } from "@/components/shopping/Countdown";
import { Thumb } from "@/components/shopping/ProductCard";
import { toggleWishAction } from "@/lib/actions/shopping";

export const metadata: Metadata = { title: "오늘끝딜 - DAYVER 쇼핑" };

export default async function DealsPage() {
  const deals = listDeals(50);
  const todays = listTodayEvents();
  const user = await getCurrentUser();
  const wishes = user ? listWishIds(user.id) : new Set<number>();
  return (
    <div className="dv-container py-8">
      <h1 className="text-[24px] font-black">오늘끝딜 <span className="text-[14px] font-normal text-dv-text-3 ml-2">매일 11시, 무료배송에 최대 혜택까지</span></h1>
      <ul className="grid grid-cols-3 gap-4 mt-6">
        {deals.map((d) => d.product && (
          <li key={d.id} className="dv-card p-4 flex gap-4 relative">
            <Link href={`/shopping/product/${d.product.id}`} className="shrink-0" aria-label="상세페이지 바로가기"><Thumb product={d.product} className="w-[140px] h-[140px]" /></Link>
            <div className="min-w-0 flex-1">
              {d.ends_at ? <Countdown endsAt={d.ends_at} /> : <span className="text-[12px] font-bold text-dv-green">멤버십 전용</span>}
              <Link href={`/shopping/product/${d.product.id}`} className="block mt-1 text-[15px] font-bold dv-clamp-2">{d.title}</Link>
              <p className="text-[12px] text-dv-text-3 mt-1">원가 <s>{won(d.product.sale_price)}</s> 원</p>
              <p><span className="text-dv-red font-bold mr-1">{Math.round(d.product.discount_rate)}%</span><b className="text-[18px]">{won(discountedPrice(d.product))}</b> 원</p>
              <p className="text-[12px] text-dv-text-3 mt-1">{d.subtitle} · 남은 수량 {d.product.stock}</p>
            </div>
            <form action={toggleWishAction} className="absolute right-3 top-3">
              <input type="hidden" name="product_id" value={d.product.id} />
              <input type="hidden" name="back" value="/shopping/deals" />
              <button type="submit" aria-label="찜하기" aria-pressed={wishes.has(d.product.id)} className={wishes.has(d.product.id) ? "text-dv-red" : "text-dv-text-3"}>{wishes.has(d.product.id) ? "♥" : "♡"}</button>
            </form>
          </li>
        ))}
      </ul>
      <h2 className="text-[20px] font-black mt-14">기획전 · 오늘의 행사</h2>
      <ul className="grid grid-cols-4 gap-4 mt-5">
        {todays.map((e) => (
          <li key={e.id}>
            <Link href={e.landing_url} className="block dv-card overflow-hidden" data-clk="shop_deals.event">
              <div className="h-28 p-4 text-white flex flex-col justify-end" style={{ background: `linear-gradient(135deg, ${e.color}, #222)` }}>
                {e.label && <span className="text-[11px] font-bold bg-white/90 text-dv-text rounded px-1.5 py-0.5 w-fit mb-1">{e.label}</span>}
                <b className="dv-clamp-2">{e.header} {e.title}</b>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
