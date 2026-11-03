import Link from "next/link";
import { discountedPrice, won, type Product } from "@/lib/shopping";
import { toggleWishAction } from "@/lib/actions/shopping";

export function Thumb({ product, className = "" }: { product: Pick<Product, "name" | "image_color">; className?: string }) {
  return (
    <div className={`dv-thumb rounded-xl text-[12px] ${className}`} style={{ background: product.image_color }} aria-hidden>
      {product.name.replace(/^\[[^\]]+\]\s*/, "").slice(0, 24)}
    </div>
  );
}

export function TagBadge({ product }: { product: Pick<Product, "tag_type" | "tag_title"> }) {
  if (!product.tag_type) return null;
  const color = product.tag_type === "MEMBERSHIP_EXCLUSIVE" ? "#03c75a" : product.tag_type === "ARRIVAL_GUARANTEE" ? "#0068c3" : "#5e3bee";
  return <span className="absolute left-2 top-2 text-[11px] font-bold text-white rounded px-1.5 py-0.5" style={{ background: color }}>{product.tag_title}</span>;
}

/** 상품 카드: 썸네일 색블록, 태그, 스토어, 이름, 할인율/가격, 리뷰, 배송 메타, 찜 */
export function ProductCard({ product, wished = false, back = "/shopping", showWish = true }: { product: Product; wished?: boolean; back?: string; showWish?: boolean }) {
  const dp = discountedPrice(product);
  return (
    <article className="relative group">
      <Link href={`/shopping/product/${product.id}`} className="block" data-clk="shop.product.card">
        <div className="relative">
          <Thumb product={product} className="aspect-square w-full" />
          <TagBadge product={product} />
        </div>
        <div className="mt-2.5 text-[13px]">
          <span className="text-dv-text-3">{product.channel_name}</span>
          <p className="dv-clamp-2 text-dv-text mt-0.5">{product.name.replace(/^\[[^\]]+\]\s*/, "")}</p>
          <p className="mt-1.5">
            {product.discount_rate > 0 && <span className="text-dv-red font-bold mr-1">{Math.round(product.discount_rate)}%</span>}
            <b className="text-[16px]">{won(dp)}</b>원
            {product.discount_rate > 0 && <s className="ml-1.5 text-dv-text-3 text-[12px]">{won(product.sale_price)}원</s>}
          </p>
          <p className="text-[12px] text-dv-text-3 mt-1">
            ★ {product.review_score.toFixed(1)} 리뷰 {won(product.review_count)}
            {product.is_free_delivery ? " · 무료배송" : ""}{product.is_today_delivery ? " · 오늘출발" : ""}{product.is_arrival_guarantee ? " · 도착보장" : ""}
          </p>
        </div>
      </Link>
      {showWish && (
        <form action={toggleWishAction} className="absolute right-2 top-2">
          <input type="hidden" name="product_id" value={product.id} />
          <input type="hidden" name="back" value={back} />
          <button type="submit" aria-label={wished ? "찜 해제" : "찜하기"} aria-pressed={wished} className={`w-8 h-8 rounded-full bg-white/90 shadow grid place-items-center ${wished ? "text-dv-red" : "text-dv-text-3"}`}>
            {wished ? "♥" : "♡"}
          </button>
        </form>
      )}
    </article>
  );
}
