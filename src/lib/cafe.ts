import "server-only";
import { all, get } from "@/lib/db";
export { CAFE_CATEGORIES } from "@/components/cafe/constants";

export type Cafe = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  region: string | null;
  owner_id: number;
  color: string;
  is_public: number;
  created_at: string;
  member_count: number;
  post_count: number;
};

export type CafePost = {
  id: number;
  cafe_id: number;
  cafe_slug: string;
  cafe_name: string;
  cafe_color: string;
  board_id: number;
  board_name: string;
  user_id: number;
  title: string;
  content: string;
  author: string;
  author_color: string;
  views: number;
  likes: number;
  comment_count: number;
  is_notice: number;
  created_at: string;
};

export type CafeBoard = { id: number; cafe_id: number; name: string; sort: number; members_only: number; post_count: number };
export type CafeMember = { user_id: number; username: string; nickname: string; avatar_color: string; role: "owner" | "staff" | "member"; joined_at: string; post_count: number };
export type CafeComment = { id: number; post_id: number; user_id: number; author: string; author_color: string; content: string; created_at: string };
export type JoinRequest = { id: number; cafe_id: number; user_id: number; username: string; nickname: string; message: string; status: string; created_at: string };

const CAFE_SELECT = `
  SELECT c.*,
    (SELECT COUNT(*) FROM cafe_members m WHERE m.cafe_id = c.id) AS member_count,
    (SELECT COUNT(*) FROM cafe_posts p WHERE p.cafe_id = c.id) AS post_count
  FROM cafes c`;

const POST_SELECT = `
  SELECT p.id, p.cafe_id, c.slug AS cafe_slug, c.name AS cafe_name, c.color AS cafe_color, p.board_id, b.name AS board_name,
    p.user_id, p.title, p.content, u.nickname AS author, u.avatar_color AS author_color, p.views, p.likes, p.is_notice, p.created_at,
    (SELECT COUNT(*) FROM cafe_comments cc WHERE cc.post_id = p.id) AS comment_count
  FROM cafe_posts p
  JOIN cafes c ON c.id = p.cafe_id
  JOIN cafe_boards b ON b.id = p.board_id
  JOIN users u ON u.id = p.user_id`;

/* ---------- 서비스 간 인터페이스 ---------- */

/** 전체 카페 인기글 (좋아요·댓글·조회 가중) */
export function listPopularPosts(limit: number): CafePost[] {
  return all<CafePost>(`${POST_SELECT} WHERE p.is_notice = 0 ORDER BY (p.likes * 3 + comment_count * 5 + p.views / 50.0) DESC, p.created_at DESC LIMIT ?`, limit);
}

export function searchCafes(query: string, limit: number): Cafe[] {
  const q = `%${query.trim()}%`;
  if (!query.trim()) return [];
  return all<Cafe>(`${CAFE_SELECT} WHERE c.name LIKE ? OR c.description LIKE ? OR c.category LIKE ? ORDER BY member_count DESC LIMIT ?`, q, q, q, limit);
}

export function searchCafePosts(query: string, limit: number): CafePost[] {
  const q = `%${query.trim()}%`;
  if (!query.trim()) return [];
  return all<CafePost>(`${POST_SELECT} WHERE p.title LIKE ? OR p.content LIKE ? ORDER BY p.created_at DESC LIMIT ?`, q, q, limit);
}

/* ---------- 카페 조회 ---------- */

export function getCafeBySlug(slug: string): Cafe | undefined {
  return get<Cafe>(`${CAFE_SELECT} WHERE c.slug = ?`, slug);
}
export function getCafeById(id: number): Cafe | undefined {
  return get<Cafe>(`${CAFE_SELECT} WHERE c.id = ?`, id);
}
export function listCafesByCategory(category: string, limit = 30): Cafe[] {
  return all<Cafe>(`${CAFE_SELECT} WHERE c.category = ? ORDER BY member_count DESC, post_count DESC LIMIT ?`, category, limit);
}
export function listCafesByRegion(): Array<Cafe> {
  return all<Cafe>(`${CAFE_SELECT} WHERE c.region IS NOT NULL ORDER BY c.region, member_count DESC`);
}
export function listRankedCafes(limit = 50): Cafe[] {
  return all<Cafe>(`${CAFE_SELECT} ORDER BY (member_count * 10 + post_count) DESC, c.created_at ASC LIMIT ?`, limit);
}
export function listRepresentativeCafes(limit = 8): Cafe[] {
  return all<Cafe>(`${CAFE_SELECT} WHERE c.is_public = 1 ORDER BY post_count DESC, member_count DESC LIMIT ?`, limit);
}
export function listPopularCafesByCategory(category: string, limit = 6): Cafe[] {
  return listCafesByCategory(category, limit);
}
export function listMyCafes(userId: number): Array<Cafe & { role: string }> {
  return all<Cafe & { role: string }>(`SELECT x.*, m.role FROM (${CAFE_SELECT}) x JOIN cafe_members m ON m.cafe_id = x.id WHERE m.user_id = ? ORDER BY m.joined_at DESC`, userId);
}
export function listMyPosts(userId: number, limit = 30): CafePost[] {
  return all<CafePost>(`${POST_SELECT} WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT ?`, userId, limit);
}
/** 지역 이웃 소식: region이 있는 카페의 최신 글 */
export function listNeighborPosts(limit = 5): Array<CafePost & { region: string }> {
  return all<CafePost & { region: string }>(`SELECT x.*, c2.region FROM (${POST_SELECT} WHERE c.region IS NOT NULL AND p.is_notice = 0) x JOIN cafes c2 ON c2.id = x.cafe_id ORDER BY x.created_at DESC LIMIT ?`, limit);
}
export function listCategoriesWithCounts(): Array<{ category: string; cnt: number }> {
  return all<{ category: string; cnt: number }>("SELECT category, COUNT(*) cnt FROM cafes GROUP BY category ORDER BY cnt DESC");
}

/* ---------- 게시판 / 글 ---------- */

export function listBoards(cafeId: number): CafeBoard[] {
  return all<CafeBoard>("SELECT b.*, (SELECT COUNT(*) FROM cafe_posts p WHERE p.board_id = b.id) AS post_count FROM cafe_boards b WHERE b.cafe_id = ? ORDER BY b.sort, b.id", cafeId);
}
export function getBoard(boardId: number): CafeBoard | undefined {
  return get<CafeBoard>("SELECT b.*, (SELECT COUNT(*) FROM cafe_posts p WHERE p.board_id = b.id) AS post_count FROM cafe_boards b WHERE b.id = ?", boardId);
}
export function listCafePosts(cafeId: number, opts: { boardId?: number; page?: number; size?: number; noticeOnly?: boolean } = {}): { posts: CafePost[]; total: number } {
  const size = opts.size ?? 20;
  const page = Math.max(1, opts.page ?? 1);
  const where: string[] = ["p.cafe_id = ?"];
  const params: Array<number | string> = [cafeId];
  if (opts.boardId) { where.push("p.board_id = ?"); params.push(opts.boardId); }
  if (opts.noticeOnly) where.push("p.is_notice = 1");
  const w = where.join(" AND ");
  const total = get<{ c: number }>(`SELECT COUNT(*) c FROM cafe_posts p WHERE ${w}`, ...params)?.c ?? 0;
  const posts = all<CafePost>(`${POST_SELECT} WHERE ${w} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, ...params, size, (page - 1) * size);
  return { posts, total };
}
export function getPost(postId: number): CafePost | undefined {
  return get<CafePost>(`${POST_SELECT} WHERE p.id = ?`, postId);
}
export function listComments(postId: number): CafeComment[] {
  return all<CafeComment>("SELECT cc.id, cc.post_id, cc.user_id, u.nickname AS author, u.avatar_color AS author_color, cc.content, cc.created_at FROM cafe_comments cc JOIN users u ON u.id = cc.user_id WHERE cc.post_id = ? ORDER BY cc.created_at ASC", postId);
}
export function hasLiked(postId: number, userId: number): boolean {
  return !!get("SELECT 1 FROM cafe_post_likes WHERE post_id = ? AND user_id = ?", postId, userId);
}

/* ---------- 멤버 ---------- */

export function getMembership(cafeId: number, userId: number): { role: "owner" | "staff" | "member" } | undefined {
  return get<{ role: "owner" | "staff" | "member" }>("SELECT role FROM cafe_members WHERE cafe_id = ? AND user_id = ?", cafeId, userId);
}
export function listMembers(cafeId: number): CafeMember[] {
  return all<CafeMember>(`SELECT m.user_id, u.username, u.nickname, u.avatar_color, m.role, m.joined_at,
      (SELECT COUNT(*) FROM cafe_posts p WHERE p.cafe_id = m.cafe_id AND p.user_id = m.user_id) AS post_count
    FROM cafe_members m JOIN users u ON u.id = m.user_id WHERE m.cafe_id = ?
    ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'staff' THEN 1 ELSE 2 END, m.joined_at`, cafeId);
}
export function listJoinRequests(cafeId: number, status = "pending"): JoinRequest[] {
  return all<JoinRequest>("SELECT r.*, u.username, u.nickname FROM cafe_join_requests r JOIN users u ON u.id = r.user_id WHERE r.cafe_id = ? AND r.status = ? ORDER BY r.created_at", cafeId, status);
}
export function getPendingRequest(cafeId: number, userId: number): JoinRequest | undefined {
  return get<JoinRequest>("SELECT r.*, '' AS username, '' AS nickname FROM cafe_join_requests r WHERE r.cafe_id = ? AND r.user_id = ? AND r.status = 'pending'", cafeId, userId);
}

/** 관리 권한: owner 또는 staff */
export function canManage(role?: string): boolean {
  return role === "owner" || role === "staff";
}

export function formatDate(s: string): string {
  // 'YYYY-MM-DD HH:MM:SS' → 오늘이면 HH:MM, 아니면 MM.DD.
  const today = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  const t = `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;
  if (s.startsWith(t)) return s.slice(11, 16);
  return `${s.slice(5, 7)}.${s.slice(8, 10)}.`;
}
