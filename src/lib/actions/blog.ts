"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { get, run, transaction } from "@/lib/db";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";

export type BlogFormState = { error?: string } | undefined;

const COLORS = ["#5e3bee", "#03c75a", "#0068c3", "#ff6f3d", "#e8457b", "#2bb3b1", "#8e6cf5", "#f2a900"];

function validate(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").trim();
  const category = String(form.get("category") ?? "일상·생각");
  const tags = String(form.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10)
    .join(",");
  const isPublic = form.get("is_public") === "0" ? 0 : 1;
  if (!title) return { error: "제목을 입력해 주세요." } as const;
  if (title.length > 100) return { error: "제목은 100자 이내로 입력해 주세요." } as const;
  if (!content) return { error: "본문을 입력해 주세요." } as const;
  if (!(BLOG_CATEGORIES as readonly string[]).includes(category)) return { error: "주제를 선택해 주세요." } as const;
  return { title, content, category, tags, isPublic } as const;
}

export async function createPostAction(_prev: BlogFormState, form: FormData): Promise<BlogFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/blog/write");
  const v = validate(form);
  if ("error" in v) return { error: v.error };
  const color = COLORS[(v.title.length + user.id) % COLORS.length];
  const { lastId } = run(
    "INSERT INTO blog_posts (user_id, title, content, category, tags, image_color, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)",
    user.id, v.title, v.content, v.category, v.tags, color, v.isPublic,
  );
  revalidatePath("/blog");
  redirect(`/blog/${user.username}/${lastId}`);
}

export async function updatePostAction(_prev: BlogFormState, form: FormData): Promise<BlogFormState> {
  const user = await getCurrentUser();
  const id = Number(form.get("id"));
  if (!user) redirect(`/login?next=/blog/edit/${id}`);
  const post = get<{ user_id: number }>("SELECT user_id FROM blog_posts WHERE id = ?", id);
  if (!post || post.user_id !== user.id) return { error: "수정 권한이 없습니다." };
  const v = validate(form);
  if ("error" in v) return { error: v.error };
  run(
    "UPDATE blog_posts SET title = ?, content = ?, category = ?, tags = ?, is_public = ?, updated_at = datetime('now','localtime') WHERE id = ?",
    v.title, v.content, v.category, v.tags, v.isPublic, id,
  );
  revalidatePath("/blog");
  redirect(`/blog/${user.username}/${id}`);
}

export async function deletePostAction(form: FormData) {
  const user = await getCurrentUser();
  const id = Number(form.get("id"));
  if (!user) redirect("/login?next=/blog");
  const post = get<{ user_id: number }>("SELECT user_id FROM blog_posts WHERE id = ?", id);
  if (post && post.user_id === user.id) run("DELETE FROM blog_posts WHERE id = ?", id);
  revalidatePath("/blog");
  redirect(`/blog/${user.username}`);
}

/** 공감 토글. */
export async function toggleLikeAction(form: FormData) {
  const user = await getCurrentUser();
  const id = Number(form.get("id"));
  const username = String(form.get("username") ?? "");
  if (!user) redirect(`/login?next=${encodeURIComponent(`/blog/${username}/${id}`)}`);
  transaction(() => {
    const liked = get("SELECT 1 FROM blog_likes WHERE post_id = ? AND user_id = ?", id, user.id);
    if (liked) {
      run("DELETE FROM blog_likes WHERE post_id = ? AND user_id = ?", id, user.id);
      run("UPDATE blog_posts SET likes = MAX(0, likes - 1) WHERE id = ?", id);
    } else {
      run("INSERT INTO blog_likes (post_id, user_id) VALUES (?, ?)", id, user.id);
      run("UPDATE blog_posts SET likes = likes + 1 WHERE id = ?", id);
    }
  });
  revalidatePath(`/blog/${username}/${id}`);
}

export async function addCommentAction(form: FormData) {
  const user = await getCurrentUser();
  const id = Number(form.get("id"));
  const username = String(form.get("username") ?? "");
  if (!user) redirect(`/login?next=${encodeURIComponent(`/blog/${username}/${id}`)}`);
  const content = String(form.get("content") ?? "").trim();
  if (!content) return;
  run("INSERT INTO blog_comments (post_id, user_id, content) VALUES (?, ?, ?)", id, user.id, content.slice(0, 500));
  const post = get<{ user_id: number; title: string }>("SELECT user_id, title FROM blog_posts WHERE id = ?", id);
  if (post && post.user_id !== user.id) {
    run(
      "INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'blog', ?, ?)",
      post.user_id, `${user.nickname}님이 '${post.title.slice(0, 20)}' 글에 댓글을 남겼습니다.`, `/blog/${username}/${id}`,
    );
  }
  revalidatePath(`/blog/${username}/${id}`);
}

export async function deleteCommentAction(form: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const cid = Number(form.get("comment_id"));
  const path = String(form.get("path") ?? "/blog");
  run("DELETE FROM blog_comments WHERE id = ? AND user_id = ?", cid, user.id);
  revalidatePath(path);
}

/** 이웃추가/이웃끊기 토글. */
export async function toggleNeighborAction(form: FormData) {
  const user = await getCurrentUser();
  const username = String(form.get("username") ?? "");
  if (!user) redirect(`/login?next=${encodeURIComponent(`/blog/${username}`)}`);
  const target = get<{ id: number; nickname: string }>("SELECT id, nickname FROM users WHERE username = ?", username);
  if (!target || target.id === user.id) return;
  const exists = get("SELECT 1 FROM blog_neighbors WHERE user_id = ? AND neighbor_id = ?", user.id, target.id);
  if (exists) {
    run("DELETE FROM blog_neighbors WHERE user_id = ? AND neighbor_id = ?", user.id, target.id);
  } else {
    run("INSERT INTO blog_neighbors (user_id, neighbor_id) VALUES (?, ?)", user.id, target.id);
    run(
      "INSERT INTO notifications (user_id, service, message, link) VALUES (?, 'blog', ?, ?)",
      target.id, `${user.nickname}님이 이웃으로 추가했습니다.`, `/blog/${user.username}`,
    );
  }
  revalidatePath(`/blog/${username}`);
}
