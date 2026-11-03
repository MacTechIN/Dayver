import "server-only";
import { all, get } from "./db";

export type StockItem = { code: string; name: string; market: "DAYSPI" | "DAYSDAQ"; sector: string; price: number; change: number; change_rate: number; volume: number; market_cap: number; search_rank: number; description: string };
export type StockIndex = { code: string; name: string; value: number; change: number; change_rate: number };
export type HistoryPoint = { day: string; close: number };
export type StockComment = { id: number; code: string; user_id: number; nickname: string; avatar_color: string; content: string; created_at: string };

export function listIndices(): StockIndex[] {
  return all<StockIndex>("SELECT * FROM stock_indices ORDER BY code");
}
export function getIndex(code: string): StockIndex | undefined {
  return get<StockIndex>("SELECT * FROM stock_indices WHERE code = ?", code.toUpperCase());
}
export function getHistory(code: string, days = 30): HistoryPoint[] {
  return all<HistoryPoint>("SELECT day, close FROM stock_history WHERE code = ? ORDER BY day DESC LIMIT ?", code, days).reverse();
}
export function getStock(code: string): StockItem | undefined {
  return get<StockItem>("SELECT * FROM stock_items WHERE code = ?", code);
}
export function listStocks(opts: { market?: string; orderBy?: "search_rank" | "change_rate" | "market_cap" | "volume"; desc?: boolean; limit?: number } = {}): StockItem[] {
  const col = opts.orderBy ?? "search_rank";
  const dir = opts.desc ? "DESC" : "ASC";
  if (opts.market) return all<StockItem>(`SELECT * FROM stock_items WHERE market = ? ORDER BY ${col} ${dir} LIMIT ?`, opts.market, opts.limit ?? 50);
  return all<StockItem>(`SELECT * FROM stock_items ORDER BY ${col} ${dir} LIMIT ?`, opts.limit ?? 50);
}
export function listByCodes(codes: string[]): StockItem[] {
  if (codes.length === 0) return [];
  const marks = codes.map(() => "?").join(",");
  return all<StockItem>(`SELECT * FROM stock_items WHERE code IN (${marks})`, ...codes);
}
export function searchStocks(q: string, limit = 30): StockItem[] {
  return all<StockItem>("SELECT * FROM stock_items WHERE name LIKE ? OR code LIKE ? ORDER BY search_rank LIMIT ?", `%${q}%`, `%${q}%`, limit);
}
export function listWatchlist(userId: number): StockItem[] {
  return all<StockItem>("SELECT s.* FROM stock_watchlist w JOIN stock_items s ON s.code = w.code WHERE w.user_id = ? ORDER BY w.created_at DESC", userId);
}
export function isWatching(userId: number, code: string): boolean {
  return !!get("SELECT 1 FROM stock_watchlist WHERE user_id = ? AND code = ?", userId, code);
}
export function listComments(code: string): StockComment[] {
  return all<StockComment>("SELECT c.id, c.code, c.user_id, u.nickname, u.avatar_color, c.content, c.created_at FROM stock_comments c JOIN users u ON u.id = c.user_id WHERE c.code = ? ORDER BY c.created_at DESC LIMIT 30", code);
}
export const won = (n: number) => n.toLocaleString("ko-KR");
export const capText = (n: number) => (n >= 1_0000_0000_0000 ? `${Math.round(n / 1_0000_0000_0000).toLocaleString()}조` : `${Math.round(n / 1_0000_0000).toLocaleString()}억`);
