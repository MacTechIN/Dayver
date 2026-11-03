import "server-only";
import { all, get, run } from "@/lib/db";

export type Press = { id: number; name: string; slug: string; category: string; logo_color: string; is_major: number };
export type Article = {
  id: number;
  press_id: number;
  press_name: string;
  section: string;
  title: string;
  summary: string;
  image_color: string;
  created_at: string;
  views: number;
};
export type ArticleFull = Article & { content: string; press_slug: string; press_color: string; is_headline: number };
export type NewsComment = { id: number; article_id: number; user_id: number; nickname: string; avatar_color: string; content: string; created_at: string };

export const NEWS_SECTIONS = ["정치", "경제", "사회", "생활/문화", "IT/과학", "세계", "엔터", "스포츠"] as const;
export const PRESS_CATEGORIES = ["주요언론사", "종합/경제", "방송/통신", "영자지", "IT", "스포츠/연예", "매거진/전문지", "지역"] as const;

const ART_COLS = `a.id, a.press_id, p.name AS press_name, a.section, a.title, a.summary, a.image_color, a.created_at, a.views`;

export function listPress(opts: { major?: boolean; category?: string; limit?: number } = {}): Press[] {
  const where: string[] = [];
  const params: Array<string | number> = [];
  if (opts.major) where.push("is_major = 1");
  if (opts.category && opts.category !== "주요언론사") {
    where.push("category = ?");
    params.push(opts.category);
  }
  const sql = `SELECT * FROM news_press ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY is_major DESC, id ASC LIMIT ?`;
  params.push(opts.limit ?? 100);
  return all<Press>(sql, ...params);
}

export function getPress(slug: string): Press | undefined {
  return get<Press>("SELECT * FROM news_press WHERE slug = ?", slug);
}
export function getPressById(id: number): Press | undefined {
  return get<Press>("SELECT * FROM news_press WHERE id = ?", id);
}

export function getPressArticles(pressId: number, limit: number): Article[] {
  return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.press_id = ? ORDER BY a.created_at DESC LIMIT ?`, pressId, limit);
}

export function listHeadlines(limit: number): Article[] {
  return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.is_headline = 1 ORDER BY a.created_at DESC LIMIT ?`, limit);
}

export function listArticlesBySection(section: string, limit: number): Article[] {
  return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.section = ? ORDER BY a.created_at DESC LIMIT ?`, section, limit);
}

export function searchArticles(query: string, limit: number): Article[] {
  const q = `%${query.trim()}%`;
  if (!query.trim()) return [];
  return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.title LIKE ? OR a.summary LIKE ? ORDER BY a.created_at DESC LIMIT ?`, q, q, limit);
}

export function listRanking(limit: number, section?: string): Article[] {
  if (section) return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.section = ? ORDER BY a.views DESC LIMIT ?`, section, limit);
  return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id ORDER BY a.views DESC LIMIT ?`, limit);
}

export function listLatest(limit: number): Article[] {
  return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id ORDER BY a.created_at DESC LIMIT ?`, limit);
}

export function getArticle(id: number): ArticleFull | undefined {
  return get<ArticleFull>(`SELECT ${ART_COLS}, a.content, a.is_headline, p.slug AS press_slug, p.logo_color AS press_color FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.id = ?`, id);
}

export function incrementViews(id: number) {
  run("UPDATE news_articles SET views = views + 1 WHERE id = ?", id);
}

export function listRelated(article: ArticleFull, limit: number): Article[] {
  return all<Article>(`SELECT ${ART_COLS} FROM news_articles a JOIN news_press p ON p.id = a.press_id WHERE a.section = ? AND a.id != ? ORDER BY a.created_at DESC LIMIT ?`, article.section, article.id, limit);
}

export function listComments(articleId: number): NewsComment[] {
  return all<NewsComment>(`SELECT c.id, c.article_id, c.user_id, u.nickname, u.avatar_color, c.content, c.created_at FROM news_comments c JOIN users u ON u.id = c.user_id WHERE c.article_id = ? ORDER BY c.created_at DESC`, articleId);
}

export function listSubscribedPressIds(userId: number): number[] {
  return all<{ press_id: number }>("SELECT press_id FROM news_subscriptions WHERE user_id = ?", userId).map((r) => r.press_id);
}

export function listSubscribedPress(userId: number): Press[] {
  return all<Press>("SELECT p.* FROM news_subscriptions s JOIN news_press p ON p.id = s.press_id WHERE s.user_id = ? ORDER BY p.name", userId);
}

/** 언론사편집: 언론사별 최신 기사 묶음 (대표 1 + 나머지) */
export function listPressEditions(pressList: Press[], perPress = 4): Array<{ press: Press; articles: Article[] }> {
  return pressList.map((press) => ({ press, articles: getPressArticles(press.id, perPress) }));
}

/** 'MM월 DD일 HH:MM' 형식 */
export function fmtTime(ts: string): string {
  const m = ts.match(/^\d{4}-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  return m ? `${m[1]}월 ${m[2]}일 ${m[3]}:${m[4]}` : ts;
}
export function fmtRelative(ts: string): string {
  const d = new Date(ts.replace(" ", "T"));
  const diff = Math.max(0, Date.now() - d.getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}
