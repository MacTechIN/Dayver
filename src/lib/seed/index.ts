import type { DatabaseSync } from "node:sqlite";
import { seedCore } from "./core";
import { seedNews } from "./news";
import { seedShopping } from "./shopping";
import { seedCafe } from "./cafe";
import { seedBlog } from "./blog";
import { seedMail } from "./mail";
import { seedMain } from "./main";
import { seedWeather } from "./weather";
import { seedStock } from "./stock";
import { seedMap } from "./map";

/**
 * 각 서비스 시드는 자기 테이블이 비어 있을 때만 데이터를 넣는다 (멱등).
 * 순서: 사용자 → 뉴스 → 쇼핑 → 카페 → 블로그 → 메일 → 메인 피드
 */
export function runSeeds(db: DatabaseSync) {
  db.exec("BEGIN");
  try {
    seedCore(db);
    seedNews(db);
    seedShopping(db);
    seedCafe(db);
    seedBlog(db);
    seedMail(db);
    seedMain(db);
    seedWeather(db);
    seedStock(db);
    seedMap(db);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

/** 테이블이 비어 있는지 */
export function isEmpty(db: DatabaseSync, table: string): boolean {
  const r = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number };
  return r.c === 0;
}

/** 결정적 의사난수 (시드가 매번 같은 데이터를 만들도록) */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export const PALETTE = [
  "#5e3bee", "#03c75a", "#0068c3", "#ff6f3d", "#e8457b", "#2bb3b1",
  "#8e6cf5", "#f2a900", "#1f8a70", "#c0392b", "#34495e", "#7f8c8d",
];

/** 'YYYY-MM-DD HH:MM:SS' 형식, now 기준 n분 전 */
export function minutesAgo(n: number): string {
  const d = new Date(Date.now() - n * 60_000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
