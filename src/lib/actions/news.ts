"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { get, run } from "@/lib/db";

function back(form: FormData, fallback: string): string {
  const v = form.get("back");
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

/** 언론사 구독 토글 */
export async function toggleSubscribeAction(form: FormData) {
  const pressId = Number(form.get("press_id"));
  const backTo = back(form, "/news");
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=" + encodeURIComponent(backTo));
  if (!Number.isInteger(pressId) || pressId <= 0) return;
  const exists = get<{ press_id: number }>("SELECT press_id FROM news_subscriptions WHERE user_id = ? AND press_id = ?", user.id, pressId);
  if (exists) run("DELETE FROM news_subscriptions WHERE user_id = ? AND press_id = ?", user.id, pressId);
  else run("INSERT INTO news_subscriptions (user_id, press_id) VALUES (?, ?)", user.id, pressId);
  revalidatePath("/news");
  revalidatePath("/news/my");
  revalidatePath("/newsstand");
  revalidatePath(backTo);
}

/** 기사 댓글 작성 */
export async function addCommentAction(form: FormData) {
  const articleId = Number(form.get("article_id"));
  const content = String(form.get("content") ?? "").trim();
  const path = `/news/article/${articleId}`;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=" + encodeURIComponent(path));
  if (!Number.isInteger(articleId) || !content) return;
  run("INSERT INTO news_comments (article_id, user_id, content) VALUES (?, ?, ?)", articleId, user.id, content.slice(0, 500));
  revalidatePath(path);
}

/** 댓글 삭제(본인만) */
export async function deleteCommentAction(form: FormData) {
  const id = Number(form.get("comment_id"));
  const articleId = Number(form.get("article_id"));
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  run("DELETE FROM news_comments WHERE id = ? AND user_id = ?", id, user.id);
  revalidatePath(`/news/article/${articleId}`);
}
