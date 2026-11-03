import type { DatabaseSync } from "node:sqlite";
import { isEmpty, rng, PALETTE, minutesAgo } from "./index";

/** 허구 언론사 (실제 언론사명 사용 금지) */
const PRESS: Array<[name: string, slug: string, category: string, major: number]> = [
  ["하루일보", "haru-ilbo", "종합/경제", 1],
  ["데이버경제", "dayver-econ", "종합/경제", 1],
  ["새벽신문", "dawn-news", "종합/경제", 1],
  ["중앙하늘일보", "sky-daily", "종합/경제", 1],
  ["모닝방송", "morning-tv", "방송/통신", 1],
  ["DBS 뉴스", "dbs-news", "방송/통신", 1],
  ["한빛통신", "hanbit-wire", "방송/통신", 1],
  ["코드타임즈", "code-times", "IT", 1],
  ["테크브리핑", "tech-briefing", "IT", 1],
  ["스포츠데이", "sports-day", "스포츠/연예", 1],
  ["스타채널", "star-channel", "스포츠/연예", 1],
  ["주간시선", "weekly-sisun", "매거진/전문지", 1],
  ["경제포커스", "econ-focus", "종합/경제", 0],
  ["시민의소리", "citizen-voice", "종합/경제", 0],
  ["나루일보", "naru-ilbo", "종합/경제", 0],
  ["오후방송", "afternoon-tv", "방송/통신", 0],
  ["파도통신", "wave-wire", "방송/통신", 0],
  ["The Daily Dayver", "daily-dayver", "영자지", 0],
  ["Seoul Morning Post", "seoul-morning", "영자지", 0],
  ["디지털포스트", "digital-post", "IT", 0],
  ["게임워치", "game-watch", "IT", 0],
  ["볼넷타임즈", "ballnet-times", "스포츠/연예", 0],
  ["무비라인", "movie-line", "스포츠/연예", 0],
  ["월간여행", "monthly-travel", "매거진/전문지", 0],
  ["건강리포트", "health-report", "매거진/전문지", 0],
  ["법률저널", "law-journal", "매거진/전문지", 0],
  ["부산오늘", "busan-today", "지역", 0],
  ["강원매일", "gangwon-daily", "지역", 0],
  ["전남타임스", "jeonnam-times", "지역", 0],
  ["제주소식", "jeju-news", "지역", 0],
];

const SECTIONS = ["정치", "경제", "사회", "생활/문화", "IT/과학", "세계", "엔터", "스포츠"];

const SUBJECTS: Record<string, string[]> = {
  정치: ["국회", "여야", "정부", "지방의회", "선관위", "청와대", "야당", "여당"],
  경제: ["코스피", "원달러 환율", "수출", "물가", "금리", "부동산 시장", "반도체 업계", "중소기업"],
  사회: ["교육청", "경찰", "지자체", "소방당국", "대학가", "시민단체", "의료계", "법원"],
  "생활/문화": ["전시회", "공연계", "출판계", "요리 트렌드", "주말 나들이", "도서관", "박물관", "축제"],
  "IT/과학": ["AI 모델", "스타트업", "우주 탐사", "배터리 기술", "클라우드", "로봇", "양자컴퓨터", "보안업계"],
  세계: ["유럽연합", "동남아 정상회의", "중동", "남미", "북극 항로", "국제기구", "아프리카", "태평양 도서국"],
  엔터: ["드라마 신작", "음원 차트", "영화제", "아이돌 그룹", "예능", "OTT", "웹툰 원작", "뮤지컬"],
  스포츠: ["프로야구", "프로축구", "농구", "배구", "e스포츠", "마라톤", "골프", "수영"],
};

const VERBS = [
  "역대 최고치 경신", "긴급 대책 발표", "전격 합의", "논란 확산", "새 기록 세워",
  "하반기 전망 밝아", "현장 점검 나서", "내년 예산 확정", "협상 급물살", "잠정 중단",
  "지원 확대", "반등 조짐", "결선 진출", "신제품 공개", "조사 착수", "시범 운영 시작",
];

const TAILS = [
  "…전문가 \"신중해야\"", "…시민 반응 엇갈려", "…업계 \"기대 이상\"", "…\"연내 마무리\"",
  "…후속 조치 주목", "…\"안전이 최우선\"", "…관계자 \"협의 중\"", "", "", "",
];

function title(r: () => number, section: string): string {
  const s = SUBJECTS[section];
  return `${s[Math.floor(r() * s.length)]}, ${VERBS[Math.floor(r() * VERBS.length)]}${TAILS[Math.floor(r() * TAILS.length)]}`;
}

function paragraphs(r: () => number, t: string, section: string, press: string): string[] {
  const n = 3 + Math.floor(r() * 3);
  const base = [
    `${t.replace(/….*$/, "")}. ${press} 취재 결과 관련 ${section} 분야에서 이번 사안은 지난 분기부터 꾸준히 제기돼 온 쟁점으로, 이해관계자들의 입장이 뚜렷하게 갈리는 상황이다.`,
    `관계자는 "현재 세부 내용을 검토하는 단계이며 확정된 사항은 없다"면서도 "이르면 다음 달 공식 입장을 내놓을 것"이라고 밝혔다. 다만 일각에서는 일정이 더 늦춰질 수 있다는 관측도 나온다.`,
    `이번 결정이 미칠 파급효과에 대해 전문가들은 단기적으로는 제한적이지만 중장기적으로는 구조적 변화를 가져올 수 있다고 분석했다. 특히 ${section} 분야의 중소 사업자들이 체감하는 영향이 클 것으로 예상된다.`,
    `시민들의 반응도 엇갈린다. 한 시민은 "방향은 맞지만 속도가 너무 빠르다"고 말했고, 다른 시민은 "오히려 늦은 감이 있다"고 평가했다. 온라인 커뮤니티에서도 찬반 토론이 이어지고 있다.`,
    `한편 유관 기관은 추가 자료를 요청한 상태이며, 관련 일정은 추후 공지될 예정이다. ${press}는 후속 보도를 통해 진행 상황을 계속 전할 계획이다.`,
  ];
  return base.slice(0, n);
}

export function seedNews(db: DatabaseSync) {
  if (!isEmpty(db, "news_press")) return;
  const r = rng(20261102);
  const insPress = db.prepare("INSERT INTO news_press (name, slug, category, logo_color, is_major) VALUES (?, ?, ?, ?, ?)");
  const ids: number[] = [];
  PRESS.forEach(([name, slug, category, major], i) => {
    const res = insPress.run(name, slug, category, PALETTE[i % PALETTE.length], major);
    ids.push(Number(res.lastInsertRowid));
  });

  const insArt = db.prepare(
    "INSERT INTO news_articles (press_id, section, title, summary, content, image_color, is_headline, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (let i = 0; i < 240; i++) {
    const pi = i % PRESS.length;
    const section = SECTIONS[Math.floor(r() * SECTIONS.length)];
    const t = title(r, section);
    const ps = paragraphs(r, t, section, PRESS[pi][0]);
    const summary = ps[0].slice(0, 110) + "…";
    const headline = i < 40 && r() < 0.5 ? 1 : 0;
    const views = Math.floor(r() * 50000) + (headline ? 20000 : 0);
    const minutes = Math.floor(r() * 60 * 36); // 최근 36시간 분산
    insArt.run(ids[pi], section, t, summary, ps.join("\n\n"), PALETTE[(i * 7 + 3) % PALETTE.length], headline, views, minutesAgo(minutes));
  }

  // 데모 사용자(haru=2)의 구독 언론사
  const insSub = db.prepare("INSERT OR IGNORE INTO news_subscriptions (user_id, press_id) VALUES (?, ?)");
  [ids[0], ids[4], ids[7], ids[9]].forEach((p) => insSub.run(2, p));
  [ids[1], ids[5]].forEach((p) => insSub.run(3, p));
}
