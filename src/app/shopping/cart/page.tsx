import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { discountedPrice, listCart, won } from "@/lib/shopping";
import { checkoutAction, removeFromCartAction, updateCartQtyAction } from "@/lib/actions/shopping";
import { Thumb } from "@/components/shopping/ProductCard";

export const metadata: Metadata = { title: "장바구니 - DAYVER 쇼핑" };

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/shopping/cart");
  const items = listCart(user.id);
  const subtotal = items.reduce((s, i) => s + discountedPrice(i.product) * i.quantity, 0);
  const delivery = items.some((i) => !i.product.is_free_delivery) ? 3000 : 0;
  return (
    <div className="dv-container py-8">
      <h1 className="text-[24px] font-black">장바구니</h1>
      <ol className="flex gap-3 text-[13px] text-dv-text-3 mt-2" aria-label="주문 단계"><li className="font-bold text-dv-purple">01 장바구니</li><li>› 02 주문/결제</li><li>› 03 주문완료</li></ol>
      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-dv-text-3">장바구니에 담긴 상품이 없습니다.</p>
          <Link href="/shopping" className="inline-block mt-4 px-5 py-2.5 rounded bg-dv-purple text-white font-bold">쇼핑 계속하기</Link>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_340px] gap-8 mt-6">
          <ul className="dv-card divide-y divide-dv-border-2">
            {items.map((i) => {
              const dp = discountedPrice(i.product);
              return (
                <li key={i.product_id} className="p-5 flex gap-4 items-center">
                  <Link href={`/shopping/product/${i.product.id}`}><Thumb product={i.product} className="w-24 h-24" /></Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-dv-text-3">{i.product.channel_name}</p>
                    <Link href={`/shopping/product/${i.product.id}`} className="block font-bold dv-clamp-2">{i.product.name.replace(/^\[[^\]]+\]\s*/, "")}</Link>
                    <p className="text-[12px] text-dv-text-3 mt-1">{i.product.is_free_delivery ? "무료배송" : "배송비 3,000원"}</p>
                  </div>
                  <form action={updateCartQtyAction} className="flex items-center gap-1">
                    <input type="hidden" name="product_id" value={i.product_id} />
                    <label className="sr-only" htmlFor={`qty-${i.product_id}`}>수량</label>
                    <input id={`qty-${i.product_id}`} type="number" name="quantity" min={1} max={99} defaultValue={i.quantity} className="w-16 border border-dv-border rounded px-2 py-1 text-center" />
                    <button type="submit" className="text-[12px] px-2 py-1 border border-dv-border rounded">변경</button>
                  </form>
                  <div className="w-32 text-right">
                    <b className="text-[16px]">{won(dp * i.quantity)}</b>원
                    {i.product.discount_rate > 0 && <p className="text-[12px] text-dv-text-3"><s>{won(i.product.sale_price * i.quantity)}원</s></p>}
                  </div>
                  <form action={removeFromCartAction}>
                    <input type="hidden" name="product_id" value={i.product_id} />
                    <button type="submit" aria-label="삭제" className="w-8 h-8 text-dv-text-3 hover:text-dv-red">✕</button>
                  </form>
                </li>
              );
            })}
          </ul>
          <aside className="dv-card p-6 h-fit sticky top-6" aria-label="결제 예정 금액">
            <dl className="space-y-2 text-[14px]">
              <div className="flex justify-between"><dt className="text-dv-text-2">총 상품금액</dt><dd>{won(subtotal)}원</dd></div>
              <div className="flex justify-between"><dt className="text-dv-text-2">배송비</dt><dd>{delivery ? `${won(delivery)}원` : "무료"}</dd></div>
              <div className="flex justify-between border-t border-dv-border pt-3 mt-3 text-[16px]"><dt className="font-bold">결제 예정 금액</dt><dd className="font-black text-dv-purple">{won(subtotal + delivery)}원</dd></div>
            </dl>
            <p className="text-[12px] text-dv-green mt-2">데이버페이 포인트 {won(Math.floor(subtotal * 0.01))}P 적립 예정</p>
            <form action={checkoutAction} className="mt-5">
              <button type="submit" className="w-full h-12 rounded bg-dv-purple text-white font-bold text-[16px]">주문하기</button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
