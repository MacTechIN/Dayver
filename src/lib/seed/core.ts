import type { DatabaseSync } from "node:sqlite";
import { scryptSync, randomBytes } from "node:crypto";
import { isEmpty, PALETTE } from "./index";

/** auth.ts의 hashPassword와 같은 형식: scrypt$salt$hash */
function hash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const h = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${h}`;
}

/** 데모 계정. 비밀번호는 모두 'dayver1234' */
export const DEMO_USERS = [
  { username: "dayver", nickname: "데이버 운영자", bio: "Dayver 공식 계정입니다." },
  { username: "haru", nickname: "하루", bio: "매일 조금씩 기록합니다." },
  { username: "minsu", nickname: "민수", bio: "카테크와 캠핑을 좋아합니다." },
  { username: "jiyeon", nickname: "지연", bio: "책방 지기. 신간 리뷰를 씁니다." },
  { username: "store_master", nickname: "스토어마스터", bio: "Dayver 쇼핑 셀러" },
  { username: "newsdesk", nickname: "뉴스데스크", bio: "Dayver 뉴스 편집팀" },
];

export function seedCore(db: DatabaseSync) {
  if (!isEmpty(db, "users")) return;
  const ins = db.prepare(
    "INSERT INTO users (username, password_hash, nickname, email, bio, avatar_color) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const pw = hash("dayver1234");
  DEMO_USERS.forEach((u, i) => {
    ins.run(u.username, pw, u.nickname, `${u.username}@dayver.com`, u.bio, PALETTE[i % PALETTE.length]);
  });
  db.prepare("INSERT INTO notices (title) VALUES (?)").run("Dayver 서비스 오픈 안내: 검색·뉴스·쇼핑·카페·블로그·메일을 한 계정으로 이용하세요.");
  db.prepare("INSERT INTO notices (title) VALUES (?)").run("11월 데이버 멤버십 적립 이벤트 안내");
}
