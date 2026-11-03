"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { all, get, run, transaction } from "@/lib/db";
import { canManage, getCafeBySlug, getMembership, getPost, CAFE_CATEGORIES } from "@/lib/cafe";

export type CafeActionState = { error?: string; ok?: boolean } | undefined;

async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

const DEFAULT_BOARDS = ["공지사항", "자유게시판", "질문답변", "정보공유", "가입인사"];

/* ---------- 카페 생성/수정/삭제 ---------- */

export async function createCafeAction(_prev: CafeActionState, form: FormData): Promise<CafeActionState> {
  const user = await requireUser("/cafe/create");
  const name = str(form, "name");
  const slug = str(form, "slug").toLowerCase();
  const category = str(form, "category");
  const description = str(form, "description");
  const region = str(form, "region") || null;
  const isPublic = form.get("is_public") === "on" ? 1 : 0;
  const color = str(form, "color") || "#03c75a";
  if (name.length < 2 || name.length > 40) return { error: "카페 이름은 2~40자여야 합니다." };
  if (!/^[a-z0-9-]{3,30}$/.test(slug)) return { error: "카페 주소는 영문 소문자, 숫자, - 로 3~30자여야 합니다." };
  if (!CAFE_CATEGORIES.includes(category)) return { error: "주제를 선택해 주세요." };
  if (getCafeBySlug(slug)) return { error: "이미 사용 중인 카페 주소입니다." };
  transaction(() => {
    const { lastId } = run("INSERT INTO cafes (slug, name, description, category, region, owner_id, color, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", slug, name, description, category, region, user.id, color, isPublic);
    run("INSERT INTO cafe_members (cafe_id, user_id, role) VALUES (?, ?, 'owner')", lastId, user.id);
    DEFAULT_BOARDS.forEach((b, i) => run("INSERT INTO cafe_boards (cafe_id, name, sort) VALUES (?, ?, ?)", lastId, b, i));
    const noticeBoard = get<{ id: number }>("SELECT id FROM cafe_boards WHERE cafe_id = ? AND name = '공지사항'", lastId)!;
    run("INSERT INTO cafe_posts (cafe_id, board_id, user_id, title, content, is_notice) VALUES (?, ?, ?, ?, ?, 1)", lastId, noticeBoard.id, user.id, `${name} 카페에 오신 것을 환영합니다`, `${name} 카페가 개설되었습니다.\n\n카페 규칙을 지켜 즐겁게 활동해 주세요.`);
    run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'cafe', ?, ?)", user.id, `'${name}' 카페를 개설했습니다.`, `/cafe/${slug}`);
  });
  redirect(`/cafe/${slug}`);
}

export async function updateCafeAction(_prev: CafeActionState, form: FormData): Promise<CafeActionState> {
  const slug = str(form, "slug");
  const user = await requireUser(`/cafe/${slug}/manage`);
  const cafe = getCafeBySlug(slug);
  if (!cafe) return { error: "카페를 찾을 수 없습니다." };
  if (!canManage(getMembership(cafe.id, user.id)?.role)) return { error: "관리 권한이 없습니다." };
  const name = str(form, "name");
  const description = str(form, "description");
  const category = str(form, "category");
  const region = str(form, "region") || null;
  const isPublic = form.get("is_public") === "on" ? 1 : 0;
  const color = str(form, "color") || cafe.color;
  if (name.length < 2) return { error: "카페 이름은 2자 이상이어야 합니다." };
  if (!CAFE_CATEGORIES.includes(category)) return { error: "주제를 선택해 주세요." };
  run("UPDATE cafes SET name = ?, description = ?, category = ?, region = ?, is_public = ?, color = ? WHERE id = ?", name, description, category, region, isPublic, color, cafe.id);
  revalidatePath(`/cafe/${slug}`);
  revalidatePath(`/cafe/${slug}/manage`);
  return { ok: true };
}

export async function deleteCafeAction(form: FormData) {
  const slug = str(form, "slug");
  const user = await requireUser(`/cafe/${slug}/manage`);
  const cafe = getCafeBySlug(slug);
  if (!cafe || cafe.owner_id !== user.id) return;
  run("DELETE FROM cafes WHERE id = ?", cafe.id);
  redirect("/cafe/my");
}

/* ---------- 가입/탈퇴 ---------- */

export async function joinCafeAction(form: FormData) {
  const slug = str(form, "slug");
  const user = await requireUser(`/cafe/${slug}`);
  const cafe = getCafeBySlug(slug);
  if (!cafe) return;
  if (getMembership(cafe.id, user.id)) return;
  if (cafe.is_public) {
    run("INSERT OR IGNORE INTO cafe_members (cafe_id, user_id, role) VALUES (?, ?, 'member')", cafe.id, user.id);
    run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'cafe', ?, ?)", user.id, `'${cafe.name}' 카페에 가입했습니다.`, `/cafe/${slug}`);
  } else {
    const existing = get("SELECT 1 FROM cafe_join_requests WHERE cafe_id = ? AND user_id = ? AND status = 'pending'", cafe.id, user.id);
    if (!existing) {
      run("INSERT INTO cafe_join_requests (cafe_id, user_id, message) VALUES (?, ?, ?)", cafe.id, user.id, str(form, "message"));
      run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'cafe', ?, ?)", cafe.owner_id, `${user.nickname}님이 '${cafe.name}' 가입을 신청했습니다.`, `/cafe/${slug}/manage?tab=requests`);
    }
  }
  revalidatePath(`/cafe/${slug}`);
}

export async function leaveCafeAction(form: FormData) {
  const slug = str(form, "slug");
  const user = await requireUser(`/cafe/${slug}`);
  const cafe = getCafeBySlug(slug);
  if (!cafe || cafe.owner_id === user.id) return;
  run("DELETE FROM cafe_members WHERE cafe_id = ? AND user_id = ?", cafe.id, user.id);
  revalidatePath(`/cafe/${slug}`);
  redirect(`/cafe/${slug}`);
}

/* ---------- 글 ---------- */

export async function createPostAction(_prev: CafeActionState, form: FormData): Promise<CafeActionState> {
  const slug = str(form, "slug");
  const user = await requireUser(`/cafe/${slug}/write`);
  const cafe = getCafeBySlug(slug);
  if (!cafe) return { error: "카페를 찾을 수 없습니다." };
  const role = getMembership(cafe.id, user.id)?.role;
  if (!role) return { error: "카페 회원만 글을 쓸 수 있습니다." };
  const boardId = Number(str(form, "board_id"));
  const board = get<{ id: number; name: string }>("SELECT id, name FROM cafe_boards WHERE id = ? AND cafe_id = ?", boardId, cafe.id);
  if (!board) return { error: "게시판을 선택해 주세요." };
  const title = str(form, "title");
  const content = str(form, "content");
  if (!title) return { error: "제목을 입력해 주세요." };
  if (!content) return { error: "내용을 입력해 주세요." };
  const isNotice = board.name === "공지사항" && canManage(role) && form.get("is_notice") === "on" ? 1 : 0;
  if (board.name === "공지사항" && !canManage(role)) return { error: "공지사항은 운영진만 작성할 수 있습니다." };
  const { lastId } = run("INSERT INTO cafe_posts (cafe_id, board_id, user_id, title, content, is_notice) VALUES (?, ?, ?, ?, ?, ?)", cafe.id, boardId, user.id, title, content, isNotice);
  redirect(`/cafe/${slug}/post/${lastId}`);
}

export async function updatePostAction(_prev: CafeActionState, form: FormData): Promise<CafeActionState> {
  const slug = str(form, "slug");
  const postId = Number(str(form, "post_id"));
  const user = await requireUser(`/cafe/${slug}/post/${postId}/edit`);
  const post = getPost(postId);
  if (!post || post.cafe_slug !== slug) return { error: "글을 찾을 수 없습니다." };
  const role = getMembership(post.cafe_id, user.id)?.role;
  if (post.user_id !== user.id && !canManage(role)) return { error: "수정 권한이 없습니다." };
  const title = str(form, "title");
  const content = str(form, "content");
  const boardId = Number(str(form, "board_id")) || post.board_id;
  if (!title || !content) return { error: "제목과 내용을 입력해 주세요." };
  run("UPDATE cafe_posts SET title = ?, content = ?, board_id = ? WHERE id = ?", title, content, boardId, postId);
  redirect(`/cafe/${slug}/post/${postId}`);
}

export async function deletePostAction(form: FormData) {
  const slug = str(form, "slug");
  const postId = Number(str(form, "post_id"));
  const user = await requireUser(`/cafe/${slug}`);
  const post = getPost(postId);
  if (!post || post.cafe_slug !== slug) return;
  const role = getMembership(post.cafe_id, user.id)?.role;
  if (post.user_id !== user.id && !canManage(role)) return;
  run("DELETE FROM cafe_posts WHERE id = ?", postId);
  revalidatePath(`/cafe/${slug}`);
  const back = str(form, "back");
  redirect(back.startsWith("/") ? back : `/cafe/${slug}/board/${post.board_id}`);
}

export async function toggleLikeAction(form: FormData) {
  const slug = str(form, "slug");
  const postId = Number(str(form, "post_id"));
  const user = await requireUser(`/cafe/${slug}/post/${postId}`);
  const post = getPost(postId);
  if (!post) return;
  const liked = get("SELECT 1 FROM cafe_post_likes WHERE post_id = ? AND user_id = ?", postId, user.id);
  transaction(() => {
    if (liked) {
      run("DELETE FROM cafe_post_likes WHERE post_id = ? AND user_id = ?", postId, user.id);
      run("UPDATE cafe_posts SET likes = MAX(0, likes - 1) WHERE id = ?", postId);
    } else {
      run("INSERT INTO cafe_post_likes (post_id, user_id) VALUES (?, ?)", postId, user.id);
      run("UPDATE cafe_posts SET likes = likes + 1 WHERE id = ?", postId);
    }
  });
  revalidatePath(`/cafe/${slug}/post/${postId}`);
}

export async function addCommentAction(form: FormData) {
  const slug = str(form, "slug");
  const postId = Number(str(form, "post_id"));
  const user = await requireUser(`/cafe/${slug}/post/${postId}`);
  const content = str(form, "content");
  const post = getPost(postId);
  if (!post || !content) return;
  run("INSERT INTO cafe_comments (post_id, user_id, content) VALUES (?, ?, ?)", postId, user.id, content.slice(0, 1000));
  if (post.user_id !== user.id) {
    run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'cafe', ?, ?)", post.user_id, `${user.nickname}님이 '${post.title}' 글에 댓글을 남겼습니다.`, `/cafe/${slug}/post/${postId}`);
  }
  revalidatePath(`/cafe/${slug}/post/${postId}`);
}

export async function deleteCommentAction(form: FormData) {
  const slug = str(form, "slug");
  const commentId = Number(str(form, "comment_id"));
  const user = await requireUser(`/cafe/${slug}`);
  const c = get<{ id: number; user_id: number; post_id: number; cafe_id: number }>("SELECT cc.id, cc.user_id, cc.post_id, p.cafe_id FROM cafe_comments cc JOIN cafe_posts p ON p.id = cc.post_id WHERE cc.id = ?", commentId);
  if (!c) return;
  const role = getMembership(c.cafe_id, user.id)?.role;
  if (c.user_id !== user.id && !canManage(role)) return;
  run("DELETE FROM cafe_comments WHERE id = ?", commentId);
  revalidatePath(`/cafe/${slug}/post/${c.post_id}`);
}

/* ---------- 관리: 게시판 ---------- */

async function requireManager(slug: string) {
  const user = await requireUser(`/cafe/${slug}/manage`);
  const cafe = getCafeBySlug(slug);
  if (!cafe) return null;
  const role = getMembership(cafe.id, user.id)?.role;
  if (!canManage(role)) return null;
  return { user, cafe, role: role! };
}

export async function addBoardAction(form: FormData) {
  const slug = str(form, "slug");
  const ctx = await requireManager(slug);
  const name = str(form, "name");
  if (!ctx || !name) return;
  const max = get<{ m: number | null }>("SELECT MAX(sort) m FROM cafe_boards WHERE cafe_id = ?", ctx.cafe.id)?.m ?? -1;
  run("INSERT INTO cafe_boards (cafe_id, name, sort, members_only) VALUES (?, ?, ?, ?)", ctx.cafe.id, name.slice(0, 20), max + 1, form.get("members_only") === "on" ? 1 : 0);
  revalidatePath(`/cafe/${slug}/manage`);
}

export async function renameBoardAction(form: FormData) {
  const slug = str(form, "slug");
  const ctx = await requireManager(slug);
  const boardId = Number(str(form, "board_id"));
  const name = str(form, "name");
  if (!ctx || !name) return;
  run("UPDATE cafe_boards SET name = ?, members_only = ? WHERE id = ? AND cafe_id = ?", name.slice(0, 20), form.get("members_only") === "on" ? 1 : 0, boardId, ctx.cafe.id);
  revalidatePath(`/cafe/${slug}/manage`);
}

export async function deleteBoardAction(form: FormData) {
  const slug = str(form, "slug");
  const ctx = await requireManager(slug);
  const boardId = Number(str(form, "board_id"));
  if (!ctx) return;
  const count = get<{ c: number }>("SELECT COUNT(*) c FROM cafe_boards WHERE cafe_id = ?", ctx.cafe.id)?.c ?? 0;
  if (count <= 1) return; // 최소 1개 유지
  run("DELETE FROM cafe_boards WHERE id = ? AND cafe_id = ?", boardId, ctx.cafe.id);
  revalidatePath(`/cafe/${slug}/manage`);
}

export async function moveBoardAction(form: FormData) {
  const slug = str(form, "slug");
  const ctx = await requireManager(slug);
  const boardId = Number(str(form, "board_id"));
  const dir = str(form, "dir") === "up" ? -1 : 1;
  if (!ctx) return;
  const boards = get<{ id: number }>("SELECT id FROM cafe_boards WHERE id = ?", boardId);
  if (!boards) return;
  const ordered = all<{ id: number }>("SELECT id FROM cafe_boards WHERE cafe_id = ? ORDER BY sort, id", ctx.cafe.id);
  const idx = ordered.findIndex((b) => b.id === boardId);
  const j = idx + dir;
  if (idx < 0 || j < 0 || j >= ordered.length) return;
  [ordered[idx], ordered[j]] = [ordered[j], ordered[idx]];
  transaction(() => ordered.forEach((b, i) => run("UPDATE cafe_boards SET sort = ? WHERE id = ?", i, b.id)));
  revalidatePath(`/cafe/${slug}/manage`);
}

/* ---------- 관리: 멤버 / 가입 신청 ---------- */

export async function changeRoleAction(form: FormData) {
  const slug = str(form, "slug");
  const ctx = await requireManager(slug);
  const userId = Number(str(form, "user_id"));
  const role = str(form, "role");
  if (!ctx || ctx.role !== "owner" || !["staff", "member"].includes(role) || userId === ctx.cafe.owner_id) return;
  run("UPDATE cafe_members SET role = ? WHERE cafe_id = ? AND user_id = ?", role, ctx.cafe.id, userId);
  revalidatePath(`/cafe/${slug}/manage`);
}

export async function kickMemberAction(form: FormData) {
  const slug = str(form, "slug");
  const ctx = await requireManager(slug);
  const userId = Number(str(form, "user_id"));
  if (!ctx || userId === ctx.cafe.owner_id) return;
  const target = getMembership(ctx.cafe.id, userId);
  if (target?.role === "staff" && ctx.role !== "owner") return;
  run("DELETE FROM cafe_members WHERE cafe_id = ? AND user_id = ?", ctx.cafe.id, userId);
  revalidatePath(`/cafe/${slug}/manage`);
}

export async function reviewJoinRequestAction(form: FormData) {
  const slug = str(form, "slug");
  const ctx = await requireManager(slug);
  const reqId = Number(str(form, "request_id"));
  const decision = str(form, "decision");
  if (!ctx || !["approved", "rejected"].includes(decision)) return;
  const req = get<{ id: number; user_id: number; status: string }>("SELECT id, user_id, status FROM cafe_join_requests WHERE id = ? AND cafe_id = ?", reqId, ctx.cafe.id);
  if (!req || req.status !== "pending") return;
  transaction(() => {
    run("UPDATE cafe_join_requests SET status = ? WHERE id = ?", decision, reqId);
    if (decision === "approved") run("INSERT OR IGNORE INTO cafe_members (cafe_id, user_id, role) VALUES (?, ?, 'member')", ctx.cafe.id, req.user_id);
    run("INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'cafe', ?, ?)", req.user_id, decision === "approved" ? `'${ctx.cafe.name}' 카페 가입이 승인되었습니다.` : `'${ctx.cafe.name}' 카페 가입이 거절되었습니다.`, `/cafe/${slug}`);
  });
  revalidatePath(`/cafe/${slug}/manage`);
}
