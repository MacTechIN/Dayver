"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { get, run } from "@/lib/db";

export async function toggleWatchAction(form: FormData) {
  const code = String(form.get("code") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/stock/item/${code}`)}`);
  if (!get("SELECT 1 FROM stock_items WHERE code = ?", code)) redirect("/stock");
  if (get("SELECT 1 FROM stock_watchlist WHERE user_id = ? AND code = ?", user.id, code)) {
    run("DELETE FROM stock_watchlist WHERE user_id = ? AND code = ?", user.id, code);
  } else {
    run("INSERT INTO stock_watchlist (user_id, code) VALUES (?, ?)", user.id, code);
  }
  revalidatePath(`/stock/item/${code}`);
  revalidatePath("/stock/my");
  revalidatePath("/stock");
}

export async function addStockCommentAction(form: FormData) {
  const code = String(form.get("code") ?? "");
  const content = String(form.get("content") ?? "").trim().slice(0, 500);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/stock/item/${code}`)}`);
  if (content && get("SELECT 1 FROM stock_items WHERE code = ?", code)) {
    run("INSERT INTO stock_comments (code, user_id, content) VALUES (?, ?, ?)", code, user.id, content);
  }
  revalidatePath(`/stock/item/${code}`);
}

export async function deleteStockCommentAction(form: FormData) {
  const id = Number(form.get("id"));
  const code = String(form.get("code") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  run("DELETE FROM stock_comments WHERE id = ? AND user_id = ?", id, user.id);
  revalidatePath(`/stock/item/${code}`);
}
