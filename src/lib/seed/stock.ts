import type { DatabaseSync } from "node:sqlite";
import { isEmpty, rng } from "./index";

const STOCKS: Array<[string, string, string, string, number]> = [
  // code, name, market, sector, base price
  ["005930", "데이버전자", "DAYSPI", "전기전자", 228500],
  ["000660", "하루하이닉스", "DAYSPI", "반도체", 1468000],
  ["035420", "데이버", "DAYSPI", "서비스업", 312000],
  ["005380", "모닝자동차", "DAYSPI", "운수장비", 268000],
  ["051910", "하늘화학", "DAYSPI", "화학", 412000],
  ["006400", "데이SDI", "DAYSPI", "전기전자", 356000],
  ["035720", "별빛카카오", "DAYSPI", "서비스업", 58400],
  ["207940", "하루바이오", "DAYSPI", "의약품", 1012000],
  ["068270", "나루셀트리온", "DAYSPI", "의약품", 198500],
  ["105560", "데이금융", "DAYSPI", "금융업", 98600],
  ["055550", "하늘금융", "DAYSPI", "금융업", 64200],
  ["003550", "모닝그룹", "DAYSPI", "지주회사", 102000],
  ["012330", "모닝모비스", "DAYSPI", "운수장비", 287000],
  ["028260", "데이물산", "DAYSPI", "유통업", 156000],
  ["066570", "모닝전자", "DAYSPI", "전기전자", 121500],
  ["096770", "새벽이노베이션", "DAYSPI", "화학", 184000],
  ["034730", "새벽주식회사", "DAYSPI", "지주회사", 201000],
  ["015760", "한빛전력", "DAYSPI", "전기가스", 38900],
  ["017670", "새벽텔레콤", "DAYSPI", "통신업", 61200],
  ["033780", "파도인삼", "DAYSPI", "음식료", 126000],
  ["259960", "코드게임즈", "DAYSPI", "서비스업", 52300],
  ["018260", "데이SDS", "DAYSPI", "서비스업", 178000],
  ["011200", "파도해운", "DAYSPI", "운수창고", 21650],
  ["373220", "하늘에너지솔루션", "DAYSPI", "전기전자", 498000],
  ["247540", "에코하루", "DAYSDAQ", "화학", 123500],
  ["086520", "에코모닝", "DAYSDAQ", "금속", 98700],
  ["028300", "하루바이오사이언스", "DAYSDAQ", "의약품", 164000],
  ["196170", "나루바이오로직스", "DAYSDAQ", "의약품", 212000],
  ["041510", "별빛엔터", "DAYSDAQ", "오락문화", 89100],
  ["352820", "하늘엔터테인먼트", "DAYSDAQ", "오락문화", 214000],
  ["263750", "펄빛게임즈", "DAYSDAQ", "오락문화", 44800],
  ["293490", "코드카카오게임즈", "DAYSDAQ", "오락문화", 19850],
  ["357780", "새벽소재", "DAYSDAQ", "반도체", 67300],
  ["058470", "모닝에너지", "DAYSDAQ", "전기가스", 21650],
  ["095700", "제넥하루", "DAYSDAQ", "의약품", 15400],
  ["112040", "별빛게임즈", "DAYSDAQ", "오락문화", 23150],
  ["039030", "이오코드", "DAYSDAQ", "기계장비", 243000],
  ["403870", "하루테크닉스", "DAYSDAQ", "반도체", 186500],
  ["240810", "원익데이", "DAYSDAQ", "반도체", 31250],
  ["214150", "클래식하루", "DAYSDAQ", "의약품", 54700],
];

const INDICES: Array<[string, string, number]> = [
  ["DAYSPI", "데이스피", 5859.08],
  ["DAYSDAQ", "데이스닥", 734.36],
];

export function seedStock(db: DatabaseSync) {
  db.exec(`
CREATE TABLE IF NOT EXISTS stock_items (
  code TEXT PRIMARY KEY, name TEXT NOT NULL, market TEXT NOT NULL, sector TEXT NOT NULL,
  price INTEGER NOT NULL, change INTEGER NOT NULL, change_rate REAL NOT NULL,
  volume INTEGER NOT NULL, market_cap INTEGER NOT NULL, search_rank INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS stock_indices (
  code TEXT PRIMARY KEY, name TEXT NOT NULL, value REAL NOT NULL, change REAL NOT NULL, change_rate REAL NOT NULL);
CREATE TABLE IF NOT EXISTS stock_history (
  code TEXT NOT NULL, day TEXT NOT NULL, close REAL NOT NULL, PRIMARY KEY (code, day));
CREATE TABLE IF NOT EXISTS stock_watchlist (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, code TEXT NOT NULL REFERENCES stock_items(code) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')), PRIMARY KEY (user_id, code));
CREATE TABLE IF NOT EXISTS stock_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));
`);
  if (!isEmpty(db, "stock_items")) return;
  const r = rng(20261102);
  const insItem = db.prepare("INSERT INTO stock_items (code, name, market, sector, price, change, change_rate, volume, market_cap, search_rank, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insHist = db.prepare("INSERT INTO stock_history (code, day, close) VALUES (?, ?, ?)");
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  const ranks = STOCKS.map((_, i) => i).sort(() => r() - 0.5);
  STOCKS.forEach(([code, name, market, sector, base], idx) => {
    // 30일 가격 경로 (랜덤워크, 마지막 값이 오늘 가격)
    let p = base * (0.85 + r() * 0.2);
    const path: number[] = [];
    for (let i = 0; i < 30; i++) {
      p = p * (1 + (r() - 0.48) * 0.04);
      path.push(Math.round(p));
    }
    const today = path[29];
    const prev = path[28];
    const change = today - prev;
    const rate = Math.round((change / prev) * 10000) / 100;
    const volume = Math.round(100_000 + r() * 9_000_000);
    const shares = Math.round(10_000_000 + r() * 500_000_000);
    insItem.run(code, name, market, sector, today, change, rate, volume, today * shares, ranks[idx] + 1,
      `${name}은(는) ${sector} 업종의 ${market === "DAYSPI" ? "유가증권" : "코스닥형"} 시장 상장사입니다. 본 데이터는 학습용 허구 데이터입니다.`);
    path.forEach((c, i) => insHist.run(code, days[i], c));
  });
  const insIdx = db.prepare("INSERT INTO stock_indices (code, name, value, change, change_rate) VALUES (?, ?, ?, ?, ?)");
  INDICES.forEach(([code, name, base]) => {
    let v = base * 0.93;
    const path: number[] = [];
    for (let i = 0; i < 30; i++) {
      v = v * (1 + (r() - 0.47) * 0.015);
      path.push(Math.round(v * 100) / 100);
    }
    const today = path[29];
    const change = Math.round((today - path[28]) * 100) / 100;
    insIdx.run(code, name, today, change, Math.round((change / path[28]) * 10000) / 100);
    path.forEach((c, i) => insHist.run(code, days[i], c));
  });
  const insC = db.prepare("INSERT INTO stock_comments (code, user_id, content, created_at) VALUES (?, ?, ?, datetime('now','localtime', ?))");
  const texts = ["장기 보유 중입니다. 실적 기대해요.", "오늘 거래량 많네요. 무슨 소식 있나요?", "분할 매수 들어갑니다.", "목표가 상향 리포트 나왔다는데 사실인가요?", "배당 일정 아시는 분?"];
  STOCKS.slice(0, 12).forEach(([code], i) => {
    for (let k = 0; k < 3; k++) insC.run(code, 1 + ((i + k) % 6), texts[(i + k) % texts.length], `-${(i * 3 + k) * 47} minutes`);
  });
  // 데모 관심종목
  db.prepare("INSERT INTO stock_watchlist (user_id, code) VALUES (2, '005930'), (2, '000660'), (2, '058470'), (3, '035420')").run();
}
