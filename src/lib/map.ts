import "server-only";
import { all, get } from "./db";

export type Place = { id: number; name: string; category: string; address: string; phone: string; hours: string; rating: number; review_count: number; x: number; y: number; color: string; description: string; distance?: number };
export type PlaceReview = { id: number; place_id: number; author: string; score: number; content: string; created_at: string };

export const MAP_CATEGORIES = ["음식점", "카페", "편의점", "병원", "주차장", "관광명소", "은행", "약국"] as const;
/** 현위치(가상): 지도 캔버스 중앙 */
export const CURRENT_LOCATION = { x: 500, y: 520, name: "데이버시 하루구 중앙로 1" };

function withDistance(p: Place): Place {
  const dx = p.x - CURRENT_LOCATION.x;
  const dy = p.y - CURRENT_LOCATION.y;
  return { ...p, distance: Math.round(Math.sqrt(dx * dx + dy * dy) * 2.4) }; // 1단위 ≈ 2.4m
}

export function listPlaces(opts: { query?: string; category?: string; limit?: number } = {}): Place[] {
  const conds: string[] = [];
  const params: Array<string | number> = [];
  if (opts.query) { conds.push("(name LIKE ? OR address LIKE ? OR category LIKE ?)"); params.push(`%${opts.query}%`, `%${opts.query}%`, `%${opts.query}%`); }
  if (opts.category) { conds.push("category = ?"); params.push(opts.category); }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const rows = all<Place>(`SELECT * FROM map_places ${where} ORDER BY rating DESC, id LIMIT ?`, ...params, opts.limit ?? 60);
  return rows.map(withDistance).sort((a, b) => (opts.query || opts.category ? (a.distance ?? 0) - (b.distance ?? 0) : 0));
}
export function getPlace(id: number): Place | undefined {
  const p = get<Place>("SELECT * FROM map_places WHERE id = ?", id);
  return p ? withDistance(p) : undefined;
}
export function listReviews(placeId: number): PlaceReview[] {
  return all<PlaceReview>("SELECT * FROM map_reviews WHERE place_id = ? ORDER BY created_at DESC", placeId);
}
export const distanceText = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);
