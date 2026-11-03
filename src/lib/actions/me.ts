"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, findUserByUsername, hashPassword, verifyPassword } from "@/lib/auth";
import { get, run } from "@/lib/db";

export type MeState = { error?: string; ok?: string } | undefined;

async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function updateProfileAction(_prev: MeState, form: FormData): Promise<MeState> {
  const user = await requireUser("/me/settings");
  const nickname = String(form.get("nickname") ?? "").trim();
  const bio = String(form.get("bio") ?? "").trim().slice(0, 200);
  const color = String(form.get("avatar_color") ?? user.avatar_color);
  if (nickname.length < 1 || nickname.length > 20) return { error: "닉네임은 1~20자여야 합니다." };
  if (!/^#[0-9a-f]{6}$/i.test(color)) return { error: "색상 값이 올바르지 않습니다." };
  run("UPDATE users SET nickname = ?, bio = ?, avatar_color = ? WHERE id = ?", nickname, bio, color, user.id);
  revalidatePath("/me");
  revalidatePath("/me/settings");
  return { ok: "프로필을 저장했습니다." };
}

export async function changePasswordAction(_prev: MeState, form: FormData): Promise<MeState> {
  const user = await requireUser("/me/settings");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const next2 = String(form.get("next2") ?? "");
  const row = findUserByUsername(user.username);
  if (!row || !verifyPassword(current, row.password_hash)) return { error: "현재 비밀번호가 일치하지 않습니다." };
  if (next.length < 8) return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  if (next !== next2) return { error: "새 비밀번호가 서로 다릅니다." };
  run("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(next), user.id);
  run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'dayver', '비밀번호가 변경되었습니다.', '/me/settings')", user.id);
  return { ok: "비밀번호를 변경했습니다." };
}

export async function updatePreferencesAction(_prev: MeState, form: FormData): Promise<MeState> {
  const user = await requireUser("/me/settings");
  const view = String(form.get("newsstand_view") ?? "thumbnail");
  if (!["thumbnail", "list"].includes(view)) return { error: "보기 방식이 올바르지 않습니다." };
  run("INSERT INTO user_settings (user_id, newsstand_view) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET newsstand_view = excluded.newsstand_view", user.id, view);
  revalidatePath("/me/settings");
  return { ok: "설정을 저장했습니다." };
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser("/me/notifications");
  run("UPDATE notifications SET read_at = datetime('now','localtime') WHERE user_id = ? AND read_at IS NULL", user.id);
  revalidatePath("/me/notifications");
}

export async function deleteNotificationAction(form: FormData) {
  const user = await requireUser("/me/notifications");
  const id = Number(form.get("id"));
  if (id) run("DELETE FROM notifications WHERE id = ? AND user_id = ?", id, user.id);
  revalidatePath("/me/notifications");
}

export async function deleteReadNotificationsAction() {
  const user = await requireUser("/me/notifications");
  run("DELETE FROM notifications WHERE user_id = ? AND read_at IS NOT NULL", user.id);
  revalidatePath("/me/notifications");
}

export async function markNotificationReadAction(form: FormData) {
  const user = await requireUser("/me/notifications");
  const id = Number(form.get("id"));
  const row = get<{ link: string }>("SELECT link FROM notifications WHERE id = ? AND user_id = ?", id, user.id);
  if (row) run("UPDATE notifications SET read_at = datetime('now','localtime') WHERE id = ?", id);
  redirect(row?.link || "/me/notifications");
}
