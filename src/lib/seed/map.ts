import type { DatabaseSync } from "node:sqlite";
import { isEmpty, rng, PALETTE } from "./index";

const CATS: Record<string, string[]> = {
  음식점: ["하루식당", "모닝밥집", "별빛파스타", "나루국수", "코드카레", "파도횟집", "한빛갈비", "데이버거", "새벽분식", "달빛삼겹", "숲속돈까스", "강변칼국수"],
  카페: ["카페 하루", "모닝브루", "별빛로스터스", "나루티하우스", "코드커피", "파도베이커리", "한빛디저트", "데이라떼", "새벽빵집", "달빛찻집"],
  편의점: ["데이마트 24", "하루편의점 중앙점", "모닝스토어 역점", "별빛마트", "나루편의점", "코드마트", "파도스토어", "한빛편의점"],
  병원: ["하루내과의원", "모닝치과", "별빛피부과", "나루정형외과", "코드안과", "파도소아과", "한빛한의원", "데이버동물병원"],
  주차장: ["중앙공영주차장", "하루타워 주차장", "모닝몰 지하주차장", "역전 환승주차장", "별빛공원 주차장", "코드스퀘어 주차장"],
  관광명소: ["데이버 전망대", "하루공원", "별빛미술관", "나루강변길", "코드박물관", "파도해변광장"],
  은행: ["데이금융 중앙지점", "하늘은행 역점", "모닝저축은행", "새벽증권 지점"],
  약국: ["하루약국", "모닝온누리약국", "별빛약국", "나루건강약국"],
};
const STREETS = ["중앙로", "하루대로", "모닝길", "별빛로", "나루길", "코드로", "파도길", "한빛대로"];
const REVIEWS = ["친절하고 깔끔해요.", "주차가 편해서 자주 갑니다.", "가격 대비 만족스러워요.", "웨이팅이 좀 있지만 기다릴 만합니다.", "재방문 의사 있어요!", "조용해서 작업하기 좋아요.", "직원분이 설명을 잘 해주세요.", "위치가 역에서 가까워요."];

export function seedMap(db: DatabaseSync) {
  db.exec(`
CREATE TABLE IF NOT EXISTS map_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, address TEXT NOT NULL,
  phone TEXT NOT NULL, hours TEXT NOT NULL, rating REAL NOT NULL, review_count INTEGER NOT NULL DEFAULT 0,
  x INTEGER NOT NULL, y INTEGER NOT NULL, color TEXT NOT NULL, description TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS map_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT, place_id INTEGER NOT NULL REFERENCES map_places(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id), author TEXT NOT NULL, score INTEGER NOT NULL, content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));
`);
  if (!isEmpty(db, "map_places")) return;
  const r = rng(4242);
  const ins = db.prepare("INSERT INTO map_places (name, category, address, phone, hours, rating, review_count, x, y, color, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insR = db.prepare("INSERT INTO map_reviews (place_id, user_id, author, score, content, created_at) VALUES (?, ?, ?, ?, ?, datetime('now','localtime', ?))");
  const authors = ["데이버 운영자", "하루", "민수", "지연", "스토어마스터", "뉴스데스크"];
  let n = 0;
  for (const [cat, names] of Object.entries(CATS)) {
    for (const name of names) {
      const x = Math.round(60 + r() * 880);
      const y = Math.round(60 + r() * 880);
      const street = STREETS[Math.floor(r() * STREETS.length)];
      const addr = `데이버시 하루구 ${street} ${Math.floor(10 + r() * 300)}`;
      const phone = `02-${Math.floor(200 + r() * 800)}-${String(Math.floor(r() * 10000)).padStart(4, "0")}`;
      const hours = cat === "편의점" ? "24시간 영업" : cat === "주차장" ? "00:00 - 24:00" : `${9 + Math.floor(r() * 3)}:00 - ${19 + Math.floor(r() * 4)}:00`;
      const rating = Math.round((3.4 + r() * 1.6) * 10) / 10;
      const { lastInsertRowid } = ins.run(name, cat, addr, phone, hours, rating, 3, x, y, PALETTE[n % PALETTE.length],
        `${name}은(는) ${addr}에 있는 ${cat}입니다. 학습용 허구 장소 정보입니다.`);
      for (let k = 0; k < 3; k++) {
        const ai = (n + k) % authors.length;
        insR.run(Number(lastInsertRowid), ai + 1, authors[ai], 3 + Math.floor(r() * 3), REVIEWS[(n + k) % REVIEWS.length], `-${(n * 5 + k) * 61} minutes`);
      }
      n++;
    }
  }
}
