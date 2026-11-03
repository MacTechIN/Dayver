import type { DatabaseSync } from "node:sqlite";
import { isEmpty } from "./index";

/** 날씨 지역 시드. 예보 값은 lib/weather.ts 에서 지역 코드+날짜 기반으로 결정적으로 생성한다. */
export const WEATHER_REGIONS: Array<{ code: string; name: string; lat: number; lon: number }> = [
  { code: "02110000", name: "서울특별시 중구", lat: 37.56, lon: 126.99 },
  { code: "02140000", name: "서울특별시 종로구", lat: 37.57, lon: 126.98 },
  { code: "02170000", name: "서울특별시 용산구", lat: 37.53, lon: 126.97 },
  { code: "02200000", name: "서울특별시 마포구", lat: 37.56, lon: 126.9 },
  { code: "02230000", name: "서울특별시 강남구", lat: 37.52, lon: 127.05 },
  { code: "02260000", name: "서울특별시 송파구", lat: 37.51, lon: 127.11 },
  { code: "02290000", name: "서울특별시 노원구", lat: 37.65, lon: 127.06 },
  { code: "02281118", name: "고양시 덕양구 관산동", lat: 37.69, lon: 126.87 },
  { code: "02410000", name: "성남시 분당구", lat: 37.38, lon: 127.12 },
  { code: "02450000", name: "수원시 영통구", lat: 37.26, lon: 127.05 },
  { code: "03110000", name: "인천광역시 연수구", lat: 37.41, lon: 126.68 },
  { code: "04110000", name: "부산광역시 해운대구", lat: 35.16, lon: 129.16 },
  { code: "05110000", name: "대구광역시 수성구", lat: 35.86, lon: 128.63 },
  { code: "06110000", name: "광주광역시 서구", lat: 35.15, lon: 126.89 },
  { code: "07110000", name: "대전광역시 유성구", lat: 36.36, lon: 127.36 },
  { code: "08110000", name: "울산광역시 남구", lat: 35.54, lon: 129.33 },
  { code: "09110000", name: "세종특별자치시", lat: 36.48, lon: 127.29 },
  { code: "10110000", name: "강원 강릉시", lat: 37.75, lon: 128.88 },
  { code: "11110000", name: "제주시", lat: 33.5, lon: 126.53 },
  { code: "12110000", name: "전주시 완산구", lat: 35.81, lon: 127.15 },
];

export function seedWeather(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS weather_regions (
    code TEXT PRIMARY KEY, name TEXT NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL, sort INTEGER NOT NULL DEFAULT 0)`);
  if (!isEmpty(db, "weather_regions")) return;
  const ins = db.prepare("INSERT INTO weather_regions (code, name, lat, lon, sort) VALUES (?, ?, ?, ?, ?)");
  WEATHER_REGIONS.forEach((r, i) => ins.run(r.code, r.name, r.lat, r.lon, i));
}
