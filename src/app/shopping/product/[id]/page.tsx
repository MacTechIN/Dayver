import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { discountedPrice, getCategory, getProduct, listRelatedProducts, listReviews, listWishIds, won } from "@/lib/shopping";
import { addToCartAction, buyNowAction, toggleWishAction, writeReviewAction } from "@/lib/actions/shopping";
import { ProductCard, TagBadge } from "@/components/shopping/ProductCard";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct(Number((await params).id));
  return { title: `${p?.name.replace(/^\[[^\]]+\]\s*/, "") ?? "상품"} - DAYVER 쇼핑` };
}

export default async function ProductPage({ params }: Props) {
  const id = Number((await params).id);
  const p = getProduct(id);
  if (!p) notFound();
  const user = await getCurrentUser();
  const wished = user ? listWishIds(user.id).has(p.id) : false;
  const cat = getCategory(p.category_id);
  const parent = cat?.parent_id ? getCategory(cat.parent_id) : null;
  const reviews = listReviews(p.id);
  const related = listRelatedProducts(p, 6);
  const dp = discountedPrice(p);
  const points = Math.floor(dp * 0.01);
  const title = p.name.replace(/^\[[^\]]+\]\s*/, "");

  return (
    <div className="dv-container py-8">
      <nav aria-label="현재 위치" className="text-[13px] text-dv-text-3 mb-4">
        <Link href="/shopping">홈</Link> › {parent && <><Link href={`/shopping/category/${parent.id}`}>{parent.name}</Link> › </>}{cat && <Link href={`/shopping/category/${cat.id}`}>{cat.name}</Link>}
      </nav>
      <section aria-label="상품 정보" className="grid grid-cols-[520px_1fr] gap-10">
        <div className="relative">
          <div className="dv-thumb rounded-2xl w-[520px] h-[520px] text-[22px]" style={{ background: p.image_color }} aria-label={`${title} 대표 이미지`}>{title}</div>
          <TagBadge product={p} />
          <ul className="flex gap-2 mt-3" aria-label="추가 이미지">
            {[0, 1, 2, 3].map((i) => <li key={i} className="w-20 h-20 rounded-lg opacity-80" style={{ background: p.image_color, filter: `brightness(${1 - i * 0.12})` }} />)}
          </ul>
        </div>
        <div>
          <Link href={`/shopping/store/${p.channel_slug}`} className="inline-flex items-center gap-1.5 text-[13px] text-dv-text-2 hover:text-dv-purple" data-clk="shop_pdp.store">
            <span className="w-5 h-5 rounded-full bg-dv-purple text-white text-[11px] grid place-items-center font-bold" aria-hidden>{p.channel_name.slice(0, 1)}</span>
            {p.channel_name} <span className="text-dv-text-3">›</span>
          </Link>
          <h1 className="text-[22px] font-bold mt-2 leading-snug">{title}</h1>
          <p className="text-[13px] text-dv-text-3 mt-1">★ {p.review_score.toFixed(1)} · 리뷰 {won(p.review_count)}개</p>
          <div className="mt-5 border-t border-dv-border pt-5">
            {p.discount_rate > 0 && <p className="text-[14px] text-dv-text-3"><s>{won(p.sale_price)}원</s></p>}
            <p className="flex items-baseline gap-2">
              {p.discount_rate > 0 && <span className="text-dv-red font-black text-[24px]">{Math.round(p.discount_rate)}%</span>}
              <b className="text-[30px]">{won(dp)}</b><span className="text-[18px]">원</span>
            </p>
            <ul className="mt-3 text-[13px] text-dv-text-2 space-y-1">
              <li><span className="inline-block w-20 text-dv-text-3">혜택</span> 데이버페이 포인트 최대 <b className="text-dv-green">{won(points)}P</b> 적립 {user ? "" : "(로그인 시 내 혜택 확인)"}</li>
              <li><span className="inline-block w-20 text-dv-text-3">배송</span> {p.is_free_delivery ? "무료배송" : "배송비 3,000원"}{p.is_today_delivery ? " · 오늘출발" : ""}{p.is_arrival_guarantee ? " · 도착보장" : ""} · 기본 배송 2~3일</li>
              <li><span className="inline-block w-20 text-dv-text-3">재고</span> {p.stock > 0 ? `${p.stock}개` : <span className="text-dv-red">품절</span>}</li>
            </ul>
          </div>
          <form className="mt-6 border-t border-dv-border pt-5">
            <input type="hidden" name="product_id" value={p.id} />
            <div className="flex items-center justify-between bg-dv-bg-2 rounded p-4">
              <span className="text-[13px] dv-ellipsis max-w-[60%]">{title}</span>
              <label className="flex items-center gap-2 text-[13px]">수량
                <input type="number" name="quantity" min={1} max={99} defaultValue={1} className="w-16 border border-dv-border rounded px-2 py-1 text-center bg-white" />
              </label>
            </div>
            <div className="grid grid-cols-[48px_1fr_1fr] gap-2 mt-4">
              <button formAction={toggleWishAction} type="submit" aria-label={wished ? "찜 해제" : "찜하기"} aria-pressed={wished} className={`h-12 border border-dv-border rounded ${wished ? "text-dv-red" : "text-dv-text-3"}`}>{wished ? "♥" : "♡"}</button>
              <button formAction={addToCartAction} type="submit" className="h-12 rounded border-2 border-dv-purple text-dv-purple font-bold" disabled={p.stock === 0}>장바구니</button>
              <button formAction={buyNowAction} type="submit" className="h-12 rounded bg-dv-purple text-white font-bold disabled:opacity-50" disabled={p.stock === 0}>바로구매</button>
            </div>
          </form>
        </div>
      </section>

      <section aria-label="상품 설명" className="mt-14 dv-card p-8">
        <h2 className="font-bold text-[18px] mb-3">상품정보</h2>
        <p className="text-[14px] text-dv-text-2 leading-7">{p.description}</p>
        <dl className="grid grid-cols-[120px_1fr_120px_1fr] gap-y-2 mt-6 text-[13px] border-t border-dv-border pt-4">
          <dt className="text-dv-text-3">상품번호</dt><dd>{String(p.id).padStart(10, "0")}</dd>
          <dt className="text-dv-text-3">카테고리</dt><dd>{parent?.name} › {cat?.name}</dd>
          <dt className="text-dv-text-3">판매자</dt><dd>{p.channel_name} ({p.channel_slug})</dd>
          <dt className="text-dv-text-3">등록일</dt><dd>{p.created_at.slice(0, 10)}</dd>
        </dl>
      </section>

      <section aria-label="리뷰" className="mt-10">
        <h2 className="font-bold text-[18px]">리뷰 <span className="text-dv-purple">{reviews.length}</span></h2>
        {user ? (
          <form action={writeReviewAction} className="dv-card p-4 mt-3 flex gap-3 items-start">
            <input type="hidden" name="product_id" value={p.id} />
            <select name="score" aria-label="별점" className="border border-dv-border rounded px-2 py-2" defaultValue={5}>
              {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{"★".repeat(s)}</option>)}
            </select>
            <textarea name="content" required placeholder="상품은 어떠셨나요? 리뷰를 남겨 주세요." className="flex-1 border border-dv-border rounded px-3 py-2 h-20" />
            <button type="submit" className="h-20 px-5 rounded bg-dv-purple text-white font-bold">등록</button>
          </form>
        ) : (
          <p className="mt-3 text-[13px] text-dv-text-3"><Link href={`/login?next=/shopping/product/${p.id}`} className="text-dv-purple font-bold">로그인</Link> 후 리뷰를 작성할 수 있습니다.</p>
        )}
        <ul className="mt-4 divide-y divide-dv-border-2 dv-card">
          {reviews.length === 0 && <li className="p-6 text-center text-dv-text-3">아직 리뷰가 없습니다.</li>}
          {reviews.map((r) => (
            <li key={r.id} className="p-4 flex gap-3">
              <span className="w-9 h-9 rounded-full grid place-items-center text-white font-bold" style={{ background: r.avatar_color }} aria-hidden>{r.nickname.slice(0, 1)}</span>
              <div>
                <p className="text-[13px]"><b>{r.nickname}</b> <span className="text-dv-purple ml-1">{"★".repeat(r.score)}</span> <time className="text-dv-text-3 ml-2">{r.created_at.slice(0, 10)}</time></p>
                <p className="mt-1 text-[14px]">{r.content}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="함께 보면 좋은 상품" className="mt-12">
        <h2 className="font-bold text-[18px] mb-4">함께 보면 좋은 상품</h2>
        <ul className="grid grid-cols-6 gap-4">
          {related.map((r) => <li key={r.id}><ProductCard product={r} showWish={false} /></li>)}
        </ul>
      </section>
    </div>
  );
}
