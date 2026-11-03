"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { createOrder, listCart } from "@/lib/shopping";

async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function addToCartAction(form: FormData) {
  const productId = Number(form.get("product_id"));
  const qty = Math.max(1, Math.min(99, Number(form.get("quantity") || 1)));
  const user = await requireUser(`/shopping/product/${productId}`);
  run(
    `INSERT INTO shop_cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = MIN(99, quantity + excluded.quantity)`,
    user.id, productId, qty,
  );
  revalidatePath("/shopping/cart");
  redirect("/shopping/cart");
}

export async function buyNowAction(form: FormData) {
  const productId = Number(form.get("product_id"));
  const qty = Math.max(1, Math.min(99, Number(form.get("quantity") || 1)));
  const user = await requireUser(`/shopping/product/${productId}`);
  const orderId = createOrder(user.id, [{ product_id: productId, quantity: qty }]);
  run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'shopping', ?, ?)", user.id, `주문 #${orderId} 결제가 완료되었습니다.`, `/shopping/orders/${orderId}`);
  redirect(`/shopping/orders/${orderId}`);
}

export async function updateCartQtyAction(form: FormData) {
  const user = await requireUser("/shopping/cart");
  const productId = Number(form.get("product_id"));
  const qty = Math.max(1, Math.min(99, Number(form.get("quantity") || 1)));
  run("UPDATE shop_cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", qty, user.id, productId);
  revalidatePath("/shopping/cart");
}

export async function removeFromCartAction(form: FormData) {
  const user = await requireUser("/shopping/cart");
  run("DELETE FROM shop_cart_items WHERE user_id = ? AND product_id = ?", user.id, Number(form.get("product_id")));
  revalidatePath("/shopping/cart");
}

export async function checkoutAction() {
  const user = await requireUser("/shopping/cart");
  const items = listCart(user.id);
  if (items.length === 0) redirect("/shopping/cart");
  const orderId = createOrder(user.id, items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })));
  run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'shopping', ?, ?)", user.id, `주문 #${orderId} 결제가 완료되었습니다.`, `/shopping/orders/${orderId}`);
  redirect(`/shopping/orders/${orderId}`);
}

export async function toggleWishAction(form: FormData) {
  const productId = Number(form.get("product_id"));
  const back = String(form.get("back") || `/shopping/product/${productId}`);
  const user = await requireUser(back);
  const exists = get("SELECT 1 FROM shop_wishes WHERE user_id = ? AND product_id = ?", user.id, productId);
  if (exists) run("DELETE FROM shop_wishes WHERE user_id = ? AND product_id = ?", user.id, productId);
  else run("INSERT INTO shop_wishes (user_id, product_id) VALUES (?, ?)", user.id, productId);
  revalidatePath(back);
  revalidatePath("/shopping/wish");
}

export async function writeReviewAction(form: FormData) {
  const productId = Number(form.get("product_id"));
  const user = await requireUser(`/shopping/product/${productId}`);
  const score = Math.max(1, Math.min(5, Number(form.get("score") || 5)));
  const content = String(form.get("content") ?? "").trim();
  if (!content) return;
  run("INSERT INTO shop_reviews (product_id, user_id, score, content) VALUES (?, ?, ?, ?)", productId, user.id, score, content);
  const agg = get<{ c: number; s: number }>("SELECT COUNT(*) c, AVG(score) s FROM shop_reviews WHERE product_id = ?", productId);
  run("UPDATE shop_products SET review_count = review_count + 1, review_score = ? WHERE id = ?", Math.round((agg?.s ?? score) * 10) / 10, productId);
  revalidatePath(`/shopping/product/${productId}`);
}
