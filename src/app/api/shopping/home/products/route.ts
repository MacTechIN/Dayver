import { NextResponse } from "next/server";
import { discountedPrice, listProductsByIds } from "@/lib/shopping";

/** GET /api/shopping/home/products?ids=1,2,3 (channelProductIds 반복 파라미터도 허용) → 상품 메타 배열 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const ids = [...(u.searchParams.get("ids") ?? "").split(","), ...u.searchParams.getAll("channelProductIds")]
    .map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0).slice(0, 100);
  const products = listProductsByIds(ids).map((p) => ({
    channelProductId: p.id,
    channelMeta: { channelNo: p.channel_id, channelUid: p.channel_slug, channelName: p.channel_name, channelSiteFullUrl: `/shopping/store/${p.channel_slug}` },
    productMeta: { productNo: p.id, name: p.name, imageColor: p.image_color, productUrl: `/shopping/product/${p.id}`, salePrice: p.sale_price, dispSalePrice: p.sale_price, categoryId: p.category_id },
    deliveryMeta: { isFreeDelivery: !!p.is_free_delivery, isTodayDelivery: !!p.is_today_delivery, isArrivalGuarantee: !!p.is_arrival_guarantee, baseFee: p.is_free_delivery ? 0 : 3000 },
    reviewMeta: { totalReviewCount: p.review_count, averageReviewScore: p.review_score },
    benefitMeta: { dispDiscountedSalePrice: discountedPrice(p), dispDiscountedRatio: p.discount_rate },
    productAdditional: { promotionTags: p.tag_type ? [{ type: p.tag_type, title: p.tag_title }] : [] },
  }));
  return NextResponse.json(products);
}
