import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  discountedPrice, getStoreCuration, listBanners, listDeals, listRelatedProducts, listShortcuts, listTodayEvents, listTrendingProducts, listWishIds, won,
} from "@/lib/shopping";
import { BannerCarousel } from "@/components/shopping/BannerCarousel";
import { Countdown } from "@/components/shopping/Countdown";
import { ProductCard, Thumb } from "@/components/shopping/ProductCard";
import { StoreCuration } from "@/components/shopping/StoreCuration";
import { toggleWishAction } from "@/lib/actions/shopping";

export default async function ShoppingHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const curationSeed = Number(sp.curation ?? 19) || 0;
  const user = await getCurrentUser();
  const wishes = user ? listWishIds(user.id) : new Set<number>();

  const banners = listBanners();
  const shortcuts = listShortcuts();
  const todays = listTodayEvents();
  const deals = listDeals(9);
  const trending = listTrendingProducts(12);
  const curation = getStoreCuration(curationSeed);

  const slides = banners.map((b) => ({
    id: b.id, title: b.title, subtitle: b.subtitle, label: b.label, color: b.color, landing_url: b.landing_url,
    products: b.product ? [b.product, ...listRelatedProducts(b.product, 1)].map((p) => ({ id: p.id, name: p.name, image_color: p.image_color })) : [],
  }));

  return (
    <>
      {/* 메인 배너 캐러셀 */}
      <div className="pt-5 overflow-hidden">
        <BannerCarousel slides={slides} />
      </div>

      {/* 숏컷 14개 + 넛지 */}
      <section aria-label="서비스 바로가기" className="dv-container mt-8">
        <ul className="flex justify-between">
          {shortcuts.map((s, i) => (
            <li key={s.id} className="relative w-[82px] text-center">
              {s.subtitle && i < 9 && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-dv-text text-white rounded-full px-2 py-0.5 after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-dv-text" role="note">
                  {s.subtitle}
                </span>
              )}
              <Link href={s.landing_url} className="flex flex-col items-center gap-2 text-[13px]" data-clk={`shop_home.shortcut.${s.title}`}>
                <span className="w-16 h-16 rounded-2xl grid place-items-center text-white font-black text-[13px] leading-tight shadow-sm" style={{ background: s.color }} aria-hidden>{s.title.slice(0, 4)}</span>
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 오늘의 행사 */}
      <section aria-label="오늘의 행사" className="dv-container mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-[22px] font-black"><span className="text-dv-purple">오늘의 행사</span> 놓치지 마세요!</h2>
          <Link href="/shopping/deals" className="text-[13px] text-dv-text-2">전체보기 ›</Link>
        </div>
        <ul className="grid grid-cols-6 gap-4 mt-5">
          {todays.map((e) => (
            <li key={e.id}>
              <Link href={e.landing_url} className="block" data-clk="shop_home.today_event" aria-label={`${e.label} ${e.header} ${e.title} 상세페이지 바로가기`}>
                <div className="relative">
                  {e.product ? <Thumb product={e.product} className="aspect-square" /> : <div className="aspect-square rounded-xl" style={{ background: e.color }} />}
                  {e.label && <span className="absolute left-2 top-2 text-[11px] font-bold text-white bg-dv-purple rounded px-1.5 py-0.5">{e.label}</span>}
                </div>
                <p className="mt-2 text-[13px] dv-clamp-2">{e.header && <b className="text-dv-purple mr-1">{e.header}</b>}{e.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 오늘끝딜 */}
      <section aria-label="오늘끝딜" className="dv-container mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-[22px] font-black"><span className="text-dv-purple">오늘만 이 가격</span> 한정수량 특가</h2>
          <Link href="/shopping/deals" className="text-[13px] text-dv-text-2">전체보기 ›</Link>
        </div>
        <ul className="grid grid-cols-3 gap-4 mt-5">
          {deals.map((d) => d.product && (
            <li key={d.id} className="dv-card p-4 flex gap-4 relative">
              <Link href={`/shopping/product/${d.product.id}`} className="shrink-0" aria-label="상세페이지 바로가기">
                <Thumb product={d.product} className="w-[120px] h-[120px]" />
              </Link>
              <div className="min-w-0 flex-1">
                {d.ends_at ? <Countdown endsAt={d.ends_at} /> : <span className="text-[12px] font-bold text-dv-green">멤버십 전용</span>}
                <Link href={`/shopping/product/${d.product.id}`} className="block mt-1 text-[14px] font-bold dv-clamp-2">{d.title}</Link>
                <p className="text-[12px] text-dv-text-3 mt-1">원가 <s>{won(d.product.sale_price)}</s> 원</p>
                <p className="mt-0.5"><span className="text-dv-red font-bold mr-1">할인율 {Math.round(d.product.discount_rate)}%</span><b className="text-[17px]">{won(discountedPrice(d.product))}</b> 원</p>
                <p className="text-[12px] text-dv-text-3 mt-1">{d.subtitle === "배송비 별도" ? <button type="button" className="border border-dv-border rounded px-1.5">배송비 별도</button> : d.subtitle}</p>
              </div>
              <form action={toggleWishAction} className="absolute right-3 top-3">
                <input type="hidden" name="product_id" value={d.product.id} />
                <input type="hidden" name="back" value="/shopping" />
                <button type="submit" aria-label="찜하기" aria-pressed={wishes.has(d.product.id)} className={wishes.has(d.product.id) ? "text-dv-red" : "text-dv-text-3"}>{wishes.has(d.product.id) ? "♥" : "♡"}</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* 요즘 많이 찾는 상품 */}
      <section aria-label="요즘 많이 찾는 상품" className="dv-container mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-[22px] font-black">요즘 많이 찾는 상품은</h2>
          <Link href="/shopping/best" className="text-[13px] text-dv-text-2">베스트 전체보기 ›</Link>
        </div>
        <ul className="grid grid-cols-6 gap-4 mt-5">
          {trending.map((p) => <li key={p.id}><ProductCard product={p} wished={wishes.has(p.id)} back="/shopping" /></li>)}
        </ul>
      </section>

      {/* AI 스토어 큐레이션 */}
      <StoreCuration
        seed={curationSeed}
        title={curation.title}
        categoryName={curation.categoryName}
        stores={curation.stores.map((s) => ({
          id: s.id, slug: s.slug, name: s.name, description: s.description, color: s.color,
          products: s.products.map((p) => ({ id: p.id, name: p.name, image_color: p.image_color, price: discountedPrice(p), discount_rate: p.discount_rate, tag_title: p.tag_title })),
        }))}
      />
    </>
  );
}
