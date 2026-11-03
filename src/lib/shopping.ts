import "server-only";
import { all, get, run, transaction } from "@/lib/db";

/* ───────── 타입 ───────── */
export type Category = { id: number; name: string; parent_id: number | null; sort: number; vertical_code: string | null };
export type CategoryNode = Category & { children: Category[] };
export type Channel = { id: number; slug: string; name: string; service_type: string; description: string; color: string };
export type Product = {
  id: number; channel_id: number; category_id: number; name: string; sale_price: number; discount_rate: number;
  image_color: string; review_count: number; review_score: number; is_free_delivery: number; is_today_delivery: number;
  is_arrival_guarantee: number; tag_type: string | null; tag_title: string | null; stock: number; description: string; created_at: string;
  channel_name: string; channel_slug: string; category_name: string;
};
export type ShopEvent = {
  id: number; kind: string; label: string; header: string; title: string; subtitle: string; landing_url: string; color: string;
  product_id: number | null; ends_at: string | null; sort: number;
};
export type Deal = ShopEvent & { product: Product | null };
export type Review = { id: number; product_id: number; user_id: number; score: number; content: string; created_at: string; nickname: string; avatar_color: string };
export type CartItem = { product_id: number; quantity: number; product: Product };
export type Order = { id: number; user_id: number; total_price: number; status: string; created_at: string; item_count: number };
export type OrderItem = { id: number; product_id: number; quantity: number; unit_price: number; product: Product };

export const SORTS = ["popular", "recent", "price_asc", "price_desc", "review"] as const;
export type Sort = (typeof SORTS)[number];

/* ───────── 가격/혜택 ───────── */
/** 표시 할인가: 10원 단위 절삭 (관측된 dispDiscountedSalePrice 역할) */
export function discountedPrice(p: Pick<Product, "sale_price" | "discount_rate">): number {
  if (!p.discount_rate) return p.sale_price;
  return Math.floor((p.sale_price * (1 - p.discount_rate / 100)) / 10) * 10;
}
export function won(n: number): string {
  return n.toLocaleString("ko-KR");
}

const PRODUCT_SELECT = `
  SELECT p.*, c.name AS channel_name, c.slug AS channel_slug, cat.name AS category_name
    FROM shop_products p
    JOIN shop_channels c ON c.id = p.channel_id
    JOIN shop_categories cat ON cat.id = p.category_id`;

function orderBy(sort: Sort): string {
  switch (sort) {
    case "recent": return "p.created_at DESC, p.id DESC";
    case "price_asc": return "(p.sale_price * (100 - p.discount_rate)) ASC";
    case "price_desc": return "(p.sale_price * (100 - p.discount_rate)) DESC";
    case "review": return "p.review_score DESC, p.review_count DESC";
    default: return "p.review_count DESC, p.id ASC";
  }
}

/* ───────── 메인 페이지용 공개 인터페이스 ───────── */
/** 요즘 많이 찾는 상품 (리뷰 많은 순) */
export function listTrendingProducts(limit = 6): Product[] {
  return all<Product>(`${PRODUCT_SELECT} ORDER BY p.review_count DESC, p.id ASC LIMIT ?`, limit);
}
/** 오늘끝딜 (DEAL 이벤트 + 상품) */
export function listDeals(limit = 9): Deal[] {
  const evs = all<ShopEvent>("SELECT * FROM shop_events WHERE kind = 'DEAL' ORDER BY sort LIMIT ?", limit);
  return evs.map((e) => ({ ...e, product: e.product_id ? getProduct(e.product_id) ?? null : null }));
}
/** 상품 검색 */
export function searchProducts(query: string, opts: { limit?: number; offset?: number; sort?: Sort } = {}): Product[] {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q.replace(/\s+/g, "%")}%`;
  return all<Product>(
    `${PRODUCT_SELECT} WHERE p.name LIKE ? OR c.name LIKE ? OR cat.name LIKE ? ORDER BY ${orderBy(opts.sort ?? "popular")} LIMIT ? OFFSET ?`,
    like, like, like, opts.limit ?? 40, opts.offset ?? 0,
  );
}
export function countSearch(query: string): number {
  const like = `%${query.trim().replace(/\s+/g, "%")}%`;
  return get<{ c: number }>(
    `SELECT COUNT(*) c FROM shop_products p JOIN shop_channels c ON c.id = p.channel_id JOIN shop_categories cat ON cat.id = p.category_id WHERE p.name LIKE ? OR c.name LIKE ? OR cat.name LIKE ?`,
    like, like, like,
  )?.c ?? 0;
}
/** 숏컷 아이콘 14개 */
export function listShortcuts(): ShopEvent[] {
  return all<ShopEvent>("SELECT * FROM shop_events WHERE kind = 'SHORTCUT' ORDER BY sort");
}

/* ───────── 홈 레이아웃 ───────── */
export function listBanners(): Deal[] {
  return all<ShopEvent>("SELECT * FROM shop_events WHERE kind = 'BANNER' ORDER BY sort").map((e) => ({ ...e, product: e.product_id ? getProduct(e.product_id) ?? null : null }));
}
export function listTodayEvents(): Deal[] {
  return all<ShopEvent>("SELECT * FROM shop_events WHERE kind = 'TODAY_EVENT' ORDER BY sort").map((e) => ({ ...e, product: e.product_id ? getProduct(e.product_id) ?? null : null }));
}
/** AI 스토어 큐레이션: 테마(상위 카테고리) 하나를 골라 스토어별 상품 묶음 */
export function getStoreCuration(seed = 0) {
  const tops = listTopCategories();
  const theme = tops[seed % tops.length];
  const stores = all<Channel & { product_count: number }>(
    `SELECT c.*, COUNT(p.id) AS product_count FROM shop_channels c
       JOIN shop_products p ON p.channel_id = c.id JOIN shop_categories cat ON cat.id = p.category_id
      WHERE cat.parent_id = ? GROUP BY c.id ORDER BY product_count DESC LIMIT 4`, theme.id,
  );
  return {
    displayType: "RANKING", dataType: "aitems", themeId: `at-${theme.id}`, categoryName: theme.name,
    title: `${theme.name}, 리뷰가 증명한 스토어 추천`,
    stores: stores.map((s) => ({
      ...s,
      products: all<Product>(`${PRODUCT_SELECT} WHERE p.channel_id = ? AND cat.parent_id = ? ORDER BY p.review_count DESC LIMIT 4`, s.id, theme.id),
    })),
  };
}

/* ───────── 카테고리 ───────── */
export function listTopCategories(): Category[] {
  return all<Category>("SELECT * FROM shop_categories WHERE parent_id IS NULL ORDER BY sort");
}
export function getCategoryTree(): CategoryNode[] {
  const tops = listTopCategories();
  const children = all<Category>("SELECT * FROM shop_categories WHERE parent_id IS NOT NULL ORDER BY sort");
  return tops.map((t) => ({ ...t, children: children.filter((c) => c.parent_id === t.id) }));
}
export function getCategory(id: number): Category | undefined {
  return get<Category>("SELECT * FROM shop_categories WHERE id = ?", id);
}
export function listChildCategories(parentId: number): Category[] {
  return all<Category>("SELECT * FROM shop_categories WHERE parent_id = ? ORDER BY sort", parentId);
}
export function listProductsByCategory(categoryId: number, opts: { sort?: Sort; limit?: number; offset?: number } = {}): { items: Product[]; total: number } {
  const cat = getCategory(categoryId);
  if (!cat) return { items: [], total: 0 };
  const where = cat.parent_id === null ? "cat.parent_id = ?" : "p.category_id = ?";
  const items = all<Product>(`${PRODUCT_SELECT} WHERE ${where} ORDER BY ${orderBy(opts.sort ?? "popular")} LIMIT ? OFFSET ?`, categoryId, opts.limit ?? 40, opts.offset ?? 0);
  const total = get<{ c: number }>(`SELECT COUNT(*) c FROM shop_products p JOIN shop_categories cat ON cat.id = p.category_id WHERE ${where}`, categoryId)?.c ?? 0;
  return { items, total };
}

/* ───────── 상품 ───────── */
export function getProduct(id: number): Product | undefined {
  return get<Product>(`${PRODUCT_SELECT} WHERE p.id = ?`, id);
}
export function listProductsByIds(ids: number[]): Product[] {
  if (ids.length === 0) return [];
  const rows = all<Product>(`${PRODUCT_SELECT} WHERE p.id IN (${ids.map(() => "?").join(",")})`, ...ids);
  const map = new Map(rows.map((r) => [r.id, r]));
  return ids.map((i) => map.get(i)).filter((x): x is Product => !!x);
}
export function listBestProducts(limit = 40): Product[] {
  return all<Product>(`${PRODUCT_SELECT} ORDER BY (p.review_count * p.review_score) DESC LIMIT ?`, limit);
}
export function listRelatedProducts(p: Product, limit = 6): Product[] {
  return all<Product>(`${PRODUCT_SELECT} WHERE p.category_id = ? AND p.id != ? ORDER BY p.review_count DESC LIMIT ?`, p.category_id, p.id, limit);
}
export function incrementStockView(_id: number) { void _id; }

/* ───────── 스토어 ───────── */
export function getChannel(slug: string): Channel | undefined {
  return get<Channel>("SELECT * FROM shop_channels WHERE slug = ?", slug);
}
export function listProductsByChannel(channelId: number, sort: Sort = "popular"): Product[] {
  return all<Product>(`${PRODUCT_SELECT} WHERE p.channel_id = ? ORDER BY ${orderBy(sort)} LIMIT 60`, channelId);
}

/* ───────── 리뷰 ───────── */
export function listReviews(productId: number): Review[] {
  return all<Review>(
    `SELECT r.*, u.nickname, u.avatar_color FROM shop_reviews r JOIN users u ON u.id = r.user_id WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 50`,
    productId,
  );
}

/* ───────── 장바구니 / 찜 / 주문 ───────── */
export function listCart(userId: number): CartItem[] {
  const rows = all<{ product_id: number; quantity: number }>("SELECT product_id, quantity FROM shop_cart_items WHERE user_id = ?", userId);
  return rows.map((r) => ({ ...r, product: getProduct(r.product_id)! })).filter((r) => r.product);
}
export function cartCount(userId: number): number {
  return get<{ c: number }>("SELECT COALESCE(SUM(quantity),0) c FROM shop_cart_items WHERE user_id = ?", userId)?.c ?? 0;
}
export function listWishIds(userId: number): Set<number> {
  return new Set(all<{ product_id: number }>("SELECT product_id FROM shop_wishes WHERE user_id = ?", userId).map((r) => r.product_id));
}
export function listWishProducts(userId: number): Product[] {
  return listProductsByIds(all<{ product_id: number }>("SELECT product_id FROM shop_wishes WHERE user_id = ? ORDER BY rowid DESC", userId).map((r) => r.product_id));
}
export function listOrders(userId: number): Order[] {
  return all<Order>(
    `SELECT o.*, (SELECT COUNT(*) FROM shop_order_items i WHERE i.order_id = o.id) AS item_count FROM shop_orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`,
    userId,
  );
}
export function getOrder(userId: number, orderId: number): { order: Order; items: OrderItem[] } | undefined {
  const order = get<Order>(`SELECT o.*, (SELECT COUNT(*) FROM shop_order_items i WHERE i.order_id = o.id) AS item_count FROM shop_orders o WHERE o.id = ? AND o.user_id = ?`, orderId, userId);
  if (!order) return undefined;
  const items = all<{ id: number; product_id: number; quantity: number; unit_price: number }>("SELECT * FROM shop_order_items WHERE order_id = ?", orderId)
    .map((i) => ({ ...i, product: getProduct(i.product_id)! }));
  return { order, items };
}
/** 장바구니 전체(또는 선택 상품) 주문 생성 */
export function createOrder(userId: number, items: Array<{ product_id: number; quantity: number }>): number {
  return transaction(() => {
    const products = listProductsByIds(items.map((i) => i.product_id));
    const total = items.reduce((s, i) => {
      const p = products.find((x) => x.id === i.product_id);
      return p ? s + discountedPrice(p) * i.quantity : s;
    }, 0);
    const { lastId } = run("INSERT INTO shop_orders (user_id, total_price, status) VALUES (?, ?, 'PAID')", userId, total);
    for (const i of items) {
      const p = products.find((x) => x.id === i.product_id);
      if (!p) continue;
      run("INSERT INTO shop_order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)", lastId, p.id, i.quantity, discountedPrice(p));
      run("UPDATE shop_products SET stock = MAX(stock - ?, 0) WHERE id = ?", i.quantity, p.id);
      run("DELETE FROM shop_cart_items WHERE user_id = ? AND product_id = ?", userId, p.id);
    }
    return lastId;
  });
}

/* ───────── 검색 보조 ───────── */
/** 자동완성: 상품명·카테고리명에서 키워드 후보 (관측된 gnb/auto-complete 응답 형태) */
export function autoComplete(keyword: string): Array<{ keywordName: string; keywordTag: string }> {
  const q = keyword.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const cats = all<{ name: string }>("SELECT name FROM shop_categories WHERE name LIKE ? ORDER BY parent_id IS NOT NULL, sort LIMIT 4", like);
  const prods = all<{ name: string }>("SELECT DISTINCT name FROM shop_products WHERE name LIKE ? ORDER BY review_count DESC LIMIT 8", like);
  const seen = new Set<string>();
  const out: Array<{ keywordName: string; keywordTag: string }> = [];
  const push = (k: string, tag: string) => { if (!seen.has(k)) { seen.add(k); out.push({ keywordName: k, keywordTag: tag }); } };
  push(q, "");
  cats.forEach((c) => push(c.name, "03"));
  prods.forEach((p) => push(p.name.replace(/^\[[^\]]+\]\s*/, ""), ""));
  return out.slice(0, 10);
}
export function relatedKeywords(query: string): string[] {
  const q = query.trim();
  if (!q) return [];
  const rows = all<{ name: string }>("SELECT name FROM shop_categories WHERE parent_id IS NOT NULL AND name LIKE ? LIMIT 6", `%${q.slice(0, 2)}%`);
  const base = [`${q} 추천`, `${q} 세트`, `${q} 할인`, `${q} 베스트`];
  return [...rows.map((r) => r.name), ...base].slice(0, 8);
}

/** 상품별 태그/혜택 (관측된 display-infos 응답 형태) */
export function displayInfos(ids: number[], userId?: number) {
  const products = listProductsByIds(ids);
  const wishes = userId ? listWishIds(userId) : new Set<number>();
  const out: Record<string, { tags: Array<{ type: string; title: string; color: string }>; myDiscountPrice: number | null; points: number | null; wished: boolean }> = {};
  for (const p of products) {
    out[String(p.id)] = {
      tags: p.tag_type ? [{ type: p.tag_type, title: p.tag_title ?? "", color: "#000000" }] : [],
      myDiscountPrice: userId ? discountedPrice(p) : null,
      points: userId ? Math.floor(discountedPrice(p) * 0.01) : null,
      wished: wishes.has(p.id),
    };
  }
  return out;
}
