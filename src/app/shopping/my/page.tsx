import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { cartCount, listOrders, listWishProducts, won } from "@/lib/shopping";
import { ProductCard } from "@/components/shopping/ProductCard";

export const metadata: Metadata = { title: "마이쇼핑 - DAYVER 쇼핑" };

export default async function MyShoppingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/shopping/my");
  const orders = listOrders(user.id);
  const wishes = listWishProducts(user.id);
  const cart = cartCount(user.id);
  const spent = orders.reduce((s, o) => s + o.total_price, 0);
  const points = Math.floor(spent * 0.01);
  return (
    <div className="dv-container py-8 grid grid-cols-[260px_1fr] gap-8">
      <aside>
        <div className="dv-card p-5">
          <span className="w-14 h-14 rounded-full grid place-items-center text-white text-xl font-black" style={{ background: user.avatar_color }} aria-hidden>{user.nickname.slice(0, 1)}</span>
          <p className="font-bold text-[16px] mt-3">{user.nickname}님</p>
          <p className="text-[12px] text-dv-text-3">{user.email}</p>
          <p className="mt-3 text-[13px]">데이버페이 포인트 <b className="text-dv-green">{won(points)}P</b></p>
          <p className="text-[12px] text-dv-text-3 mt-1">멤버십: <span className="text-dv-purple font-bold">미가입</span> · 가입 시 최대 5% 적립</p>
        </div>
        <nav aria-label="마이쇼핑 메뉴" className="dv-card mt-4 py-2 text-[14px]">
          <ul>
            <li><Link href="/shopping/orders" className="block px-5 py-2 hover:bg-dv-bg-3">주문/배송 조회</Link></li>
            <li><Link href="/shopping/cart" className="block px-5 py-2 hover:bg-dv-bg-3">장바구니 <span className="text-dv-purple">{cart}</span></Link></li>
            <li><Link href="/shopping/wish" className="block px-5 py-2 hover:bg-dv-bg-3">찜한 상품 <span className="text-dv-purple">{wishes.length}</span></Link></li>
            <li><Link href="/me" className="block px-5 py-2 hover:bg-dv-bg-3">알림/설정</Link></li>
          </ul>
        </nav>
      </aside>
      <section>
        <h1 className="text-[24px] font-black">마이쇼핑</h1>
        <ul className="grid grid-cols-4 gap-3 mt-5">
          {[
            ["주문", orders.length, "/shopping/orders"], ["장바구니", cart, "/shopping/cart"], ["찜", wishes.length, "/shopping/wish"], ["누적 구매", `${won(spent)}원`, "/shopping/orders"],
          ].map(([n, v, h]) => (
            <li key={String(n)}><Link href={String(h)} className="dv-card block p-4"><b className="block text-[20px] text-dv-purple">{v}</b><span className="text-[13px] text-dv-text-2">{n}</span></Link></li>
          ))}
        </ul>
        <h2 className="font-bold text-[18px] mt-10">최근 주문</h2>
        <ul className="dv-card mt-3 divide-y divide-dv-border-2">
          {orders.length === 0 && <li className="p-8 text-center text-dv-text-3">주문 내역이 없습니다.</li>}
          {orders.slice(0, 5).map((o) => (
            <li key={o.id} className="p-4 flex items-center gap-4 text-[14px]">
              <span className="text-dv-text-3 w-36">{o.created_at.slice(0, 16)}</span>
              <Link href={`/shopping/orders/${o.id}`} className="flex-1 font-bold">주문번호 {String(o.id).padStart(8, "0")} · {o.item_count}종</Link>
              <b>{won(o.total_price)}원</b>
            </li>
          ))}
        </ul>
        <h2 className="font-bold text-[18px] mt-10">찜한 상품</h2>
        {wishes.length === 0 ? <p className="mt-3 text-dv-text-3 text-[13px]">찜한 상품이 없습니다.</p> : (
          <ul className="grid grid-cols-4 gap-4 mt-3">{wishes.slice(0, 8).map((p) => <li key={p.id}><ProductCard product={p} wished back="/shopping/my" /></li>)}</ul>
        )}
      </section>
    </div>
  );
}
