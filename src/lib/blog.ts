import "server-only";
import { all, get, run } from "./db";
import { BLOG_CATEGORIES } from "./blog-categories";

export { BLOG_CATEGORIES };

export type BlogPost = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: string;
  tags: string;
  image_color: string | null;
  is_public: number;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
  username: string;
  nickname: string;
  avatar_color: string;
  comment_count: number;
};

export type BlogAuthor = {
  id: number;
  username: string;
  nickname: string;
  bio: string;
  avatar_color: string;
  created_at: string;
};

export type BlogComment = {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  nickname: string;
  username: string;
  avatar_color: string;
};

const POST_SELECT = `
  SELECT p.*, u.username, u.nickname, u.avatar_color,
         (SELECT COUNT(*) FROM blog_comments c WHERE c.post_id = p.id) AS comment_count
    FROM blog_posts p JOIN users u ON u.id = p.user_id`;

/** 최근 공개 글 (메인/블로그 홈). */
export function listRecentPosts(limit = 20, offset = 0): BlogPost[] {
  return all<BlogPost>(`${POST_SELECT} WHERE p.is_public = 1 ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, limit, offset);
}

/** 제목/본문/태그 검색. */
export function searchBlogPosts(query: string, limit = 30): BlogPost[] {
  const q = `%${query.trim()}%`;
  if (!query.trim()) return [];
  return all<BlogPost>(
    `${POST_SELECT} WHERE p.is_public = 1 AND (p.title LIKE ? OR p.content LIKE ? OR p.tags LIKE ?) ORDER BY p.created_at DESC LIMIT ?`,
    q, q, q, limit,
  );
}

export function listPostsByCategory(category: string, limit = 20, offset = 0): BlogPost[] {
  if (!category || category === "전체") return listRecentPosts(limit, offset);
  return all<BlogPost>(
    `${POST_SELECT} WHERE p.is_public = 1 AND p.category = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    category, limit, offset,
  );
}

export function countPostsByCategory(category: string): number {
  if (!category || category === "전체") return get<{ c: number }>("SELECT COUNT(*) c FROM blog_posts WHERE is_public = 1")?.c ?? 0;
  return get<{ c: number }>("SELECT COUNT(*) c FROM blog_posts WHERE is_public = 1 AND category = ?", category)?.c ?? 0;
}

/** 공감 많은 글 (핫토픽 카드용). */
export function listHotPosts(limit = 3): BlogPost[] {
  return all<BlogPost>(`${POST_SELECT} WHERE p.is_public = 1 ORDER BY p.likes DESC, p.views DESC LIMIT ?`, limit);
}

export function getAuthorByUsername(username: string): BlogAuthor | undefined {
  return get<BlogAuthor>("SELECT id, username, nickname, bio, avatar_color, created_at FROM users WHERE username = ?", username);
}

export function listPostsByUser(userId: number, includePrivate: boolean, category?: string): BlogPost[] {
  const parts = [`${POST_SELECT} WHERE p.user_id = ?`];
  const params: Array<string | number> = [userId];
  if (!includePrivate) parts.push("AND p.is_public = 1");
  if (category) {
    parts.push("AND p.category = ?");
    params.push(category);
  }
  parts.push("ORDER BY p.created_at DESC");
  return all<BlogPost>(parts.join(" "), ...params);
}

export function listUserCategoryCounts(userId: number, includePrivate: boolean): Array<{ category: string; c: number }> {
  return all<{ category: string; c: number }>(
    `SELECT category, COUNT(*) c FROM blog_posts WHERE user_id = ? ${includePrivate ? "" : "AND is_public = 1"} GROUP BY category ORDER BY c DESC`,
    userId,
  );
}

export function getPost(id: number): BlogPost | undefined {
  return get<BlogPost>(`${POST_SELECT} WHERE p.id = ?`, id);
}

export function incrementViews(id: number) {
  run("UPDATE blog_posts SET views = views + 1 WHERE id = ?", id);
}

export function listComments(postId: number): BlogComment[] {
  return all<BlogComment>(
    `SELECT c.*, u.nickname, u.username, u.avatar_color FROM blog_comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    postId,
  );
}

export function hasLiked(postId: number, userId: number): boolean {
  return !!get("SELECT 1 FROM blog_likes WHERE post_id = ? AND user_id = ?", postId, userId);
}

export function isNeighbor(userId: number, neighborId: number): boolean {
  return !!get("SELECT 1 FROM blog_neighbors WHERE user_id = ? AND neighbor_id = ?", userId, neighborId);
}

export function countNeighbors(userId: number): number {
  return get<{ c: number }>("SELECT COUNT(*) c FROM blog_neighbors WHERE neighbor_id = ?", userId)?.c ?? 0;
}

/** 이웃새글: 내가 이웃으로 추가한 사람들의 최근 글. */
export function listNeighborPosts(userId: number, limit = 30): BlogPost[] {
  return all<BlogPost>(
    `${POST_SELECT} WHERE p.is_public = 1 AND p.user_id IN (SELECT neighbor_id FROM blog_neighbors WHERE user_id = ?) ORDER BY p.created_at DESC LIMIT ?`,
    userId, limit,
  );
}

/** 같은 블로그 안에서 이전/다음 글. */
export function getAdjacentPosts(post: BlogPost, includePrivate: boolean) {
  const pub = includePrivate ? "" : "AND is_public = 1";
  const prev = get<{ id: number; title: string }>(
    `SELECT id, title FROM blog_posts WHERE user_id = ? AND created_at < ? ${pub} ORDER BY created_at DESC LIMIT 1`,
    post.user_id, post.created_at,
  );
  const next = get<{ id: number; title: string }>(
    `SELECT id, title FROM blog_posts WHERE user_id = ? AND created_at > ? ${pub} ORDER BY created_at ASC LIMIT 1`,
    post.user_id, post.created_at,
  );
  return { prev, next };
}

/** 이달의 블로그: 최근 30일 공감 합계 상위 블로거. */
export function listTopBloggers(limit = 6): Array<BlogAuthor & { total_likes: number; post_count: number }> {
  return all(
    `SELECT u.id, u.username, u.nickname, u.bio, u.avatar_color, u.created_at,
            SUM(p.likes) total_likes, COUNT(p.id) post_count
       FROM users u JOIN blog_posts p ON p.user_id = u.id
      WHERE p.is_public = 1
      GROUP BY u.id ORDER BY total_likes DESC LIMIT ?`,
    limit,
  );
}

/** "n분 전" 표기. */
export function timeAgo(iso: string): string {
  const t = new Date(iso.replace(" ", "T")).getTime();
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return iso.slice(0, 10);
}

/** 본문 첫 문단 요약. */
export function excerpt(content: string, len = 160): string {
  const text = content.replace(/\s+/g, " ").trim();
  return text.length > len ? `${text.slice(0, len)}…` : text;
}
