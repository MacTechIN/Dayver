import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrder, won } from "@/lib/shopping";
import { Thumb } from "@/components/shopping/ProductCard";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "주문완료 - DAYVER 쇼핑" };

export default async function OrderDetailPage({ params }: Props) {
  const id = Number((await params).id);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/shopping/orders/${id}`);
  const data = getOrder(user.id, id);
  if (!data) notFound();
  const { order, items } = data;
  return (
    <div className="dv-container py-8">
      <ol className="flex gap-3 text-[13px] text-dv-text-3" aria-label="주문 단계"><li>01 장바구니 ›</li><li>02 주문/결제 ›</li><li className="font-bold text-dv-purple">03 주문완료</li></ol>
      <h1 className="text-[24px] font-black mt-2">주문이 완료되었습니다</h1>
      <p className="text-dv-text-2 mt-1">주문번호 <b>{String(order.id).padStart(8, "0")}</b> · {order.created_at} · <span className="text-dv-green font-bold">결제완료</span></p>
      <ul className="mt-6 dv-card divide-y divide-dv-border-2">
        {items.map((i) => (
          <li key={i.id} className="p-5 flex items-center gap-4">
            <Thumb product={i.product} className="w-20 h-20" />
            <div className="flex-1">
              <p className="text-[12px] text-dv-text-3">{i.product.channel_name}</p>
              <Link href={`/shopping/product/${i.product.id}`} className="font-bold">{i.product.name.replace(/^\[[^\]]+\]\s*/, "")}</Link>
              <p className="text-[13px] text-dv-text-2 mt-1">{won(i.unit_price)}원 × {i.quantity}</p>
            </div>
            <b>{won(i.unit_price * i.quantity)}원</b>
          </li>
        ))}
        <li className="p-5 flex justify-between text-[16px]"><span className="font-bold">총 결제금액</span><b className="text-dv-purple">{won(order.total_price)}원</b></li>
      </ul>
      <div className="flex gap-2 mt-6">
        <Link href="/shopping/orders" className="px-5 py-2.5 rounded border border-dv-border font-bold">주문내역 보기</Link>
        <Link href="/shopping" className="px-5 py-2.5 rounded bg-dv-purple text-white font-bold">쇼핑 계속하기</Link>
      </div>
    </div>
  );
}
