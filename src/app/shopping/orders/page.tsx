import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listOrders, won } from "@/lib/shopping";

export const metadata: Metadata = { title: "주문내역 - DAYVER 쇼핑" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/shopping/orders");
  const orders = listOrders(user.id);
  return (
    <div className="dv-container py-8">
      <h1 className="text-[24px] font-black">주문내역</h1>
      <ul className="mt-6 dv-card divide-y divide-dv-border-2">
        {orders.length === 0 && <li className="p-12 text-center text-dv-text-3">주문 내역이 없습니다.</li>}
        {orders.map((o) => (
          <li key={o.id} className="p-5 flex items-center gap-4">
            <span className="text-[13px] text-dv-text-3 w-36">{o.created_at.slice(0, 16)}</span>
            <Link href={`/shopping/orders/${o.id}`} className="font-bold flex-1">주문번호 {String(o.id).padStart(8, "0")} · 상품 {o.item_count}종</Link>
            <span className="text-[12px] px-2 py-0.5 rounded bg-dv-green/10 text-dv-green font-bold">{o.status === "PAID" ? "결제완료" : o.status}</span>
            <b className="w-32 text-right">{won(o.total_price)}원</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
