import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { get, run } from "./db";

export const SESSION_COOKIE = "dv_session";
const SESSION_DAYS = 14;

export type User = {
  id: number;
  username: string;
  nickname: string;
  email: string;
  bio: string;
  avatar_color: string;
  created_at: string;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const h = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${h}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [, salt, h] = stored.split("$");
  if (!salt || !h) return false;
  const a = Buffer.from(h, "hex");
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

function expiresAt(): string {
  return new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
}

/** 세션을 만들고 쿠키를 설정한다 (서버 액션/라우트 핸들러에서만 호출). */
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  run("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", token, userId, expiresAt());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) run("DELETE FROM sessions WHERE token = ?", token);
  jar.delete(SESSION_COOKIE);
}

/** 현재 로그인 사용자 (없으면 null). 서버 컴포넌트/액션/라우트에서 사용. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = get<User & { expires_at: string }>(
    `SELECT u.id, u.username, u.nickname, u.email, u.bio, u.avatar_color, u.created_at, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`,
    token,
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    run("DELETE FROM sessions WHERE token = ?", token);
    return null;
  }
  const { expires_at: _e, ...user } = row;
  void _e;
  return user;
}

export function findUserByUsername(username: string) {
  return get<User & { password_hash: string }>("SELECT * FROM users WHERE username = ?", username);
}

export function findUserById(id: number) {
  return get<User>("SELECT id, username, nickname, email, bio, avatar_color, created_at FROM users WHERE id = ?", id);
}
