"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, findUserByUsername, hashPassword, verifyPassword } from "@/lib/auth";
import { run } from "@/lib/db";

export type AuthState = { error?: string } | undefined;

function safeNext(v: FormDataEntryValue | null, fallback = "/"): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
}

export async function loginAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  if (!username || !password) return { error: "아이디와 비밀번호를 입력해 주세요." };
  const user = findUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "아이디 또는 비밀번호가 잘못 되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요." };
  }
  await createSession(user.id);
  redirect(next);
}

export async function signupAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const password2 = String(form.get("password2") ?? "");
  const nickname = String(form.get("nickname") ?? "").trim();
  if (!/^[a-z0-9_]{4,20}$/.test(username)) return { error: "아이디는 영문 소문자, 숫자, _ 로 4~20자여야 합니다." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (password !== password2) return { error: "비밀번호가 일치하지 않습니다." };
  if (!nickname) return { error: "닉네임을 입력해 주세요." };
  if (findUserByUsername(username)) return { error: "이미 사용 중인 아이디입니다." };
  const colors = ["#5e3bee", "#03c75a", "#0068c3", "#ff6f3d", "#e8457b", "#2bb3b1"];
  const color = colors[username.length % colors.length];
  const { lastId } = run(
    "INSERT INTO users (username, password_hash, nickname, email, avatar_color) VALUES (?, ?, ?, ?, ?)",
    username, hashPassword(password), nickname, `${username}@dayver.com`, color,
  );
  run("INSERT INTO user_settings (user_id) VALUES (?)", lastId);
  run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'dayver', ?, '/me')", lastId, `${nickname}님, Dayver에 오신 것을 환영합니다.`);
  await createSession(lastId);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
