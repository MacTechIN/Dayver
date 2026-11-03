import type { DatabaseSync } from "node:sqlite";
import { isEmpty, minutesAgo, PALETTE, rng } from "./index";


const CAFES: Array<{ slug: string; name: string; category: string; description: string; region?: string; isPublic?: boolean }> = [
  { slug: "toonlovers", name: "툰러버스 - 웹툰 덕후 모임", category: "만화/애니", description: "매주 신작 웹툰과 애니 소식을 나누는 카페" },
  { slug: "animeclub", name: "애니클럽 코리아", category: "만화/애니", description: "분기 신작 애니 감상평, 성우, 굿즈 정보" },
  { slug: "smartliving", name: "똑똑한 살림 연구소", category: "생활", description: "살림 팁, 생활용품 리뷰, 절약 노하우" },
  { slug: "dukyang-mom", name: "덕양구맘 오세요", category: "지역", description: "고양시 덕양구 엄마들의 정보 교류", region: "고양시 덕양구" },
  { slug: "wonheung", name: "원흥 이웃 모임", category: "지역", description: "원흥동 주민 커뮤니티", region: "고양시 덕양구" },
  { slug: "wondang-castle", name: "원당역 행복 아파트", category: "지역", description: "입주민 소통 공간", region: "고양시 덕양구", isPublic: false },
  { slug: "englishdaily", name: "매일 영어 한 문장", category: "외국어", description: "하루 한 문장 영어 습관 만들기" },
  { slug: "nihongo", name: "일본어 공부방", category: "외국어", description: "JLPT 대비, 회화 스터디 모집" },
  { slug: "volunteer-together", name: "함께하는 봉사", category: "종교/봉사", description: "지역 봉사 활동 모집과 후기" },
  { slug: "gongsi", name: "공시생 응원 카페", category: "교육", description: "공무원 시험 준비생들의 정보 나눔" },
  { slug: "edu-parents", name: "초등 학부모 교육 카페", category: "교육", description: "초등 교육 정보, 학원·교재 후기" },
  { slug: "indie-music", name: "인디음악 다방", category: "음악", description: "인디 밴드 공연 소식과 추천 플레이리스트" },
  { slug: "pianoroom", name: "피아노 연습실", category: "음악", description: "취미 피아노 연주 영상 공유" },
  { slug: "diet-mate", name: "다이어트 메이트", category: "건강/다이어트", description: "식단 인증, 운동 루틴 공유" },
  { slug: "homefit", name: "홈트 하는 사람들", category: "건강/다이어트", description: "집에서 하는 운동 루틴 공유" },
  { slug: "writers-room", name: "글쓰는 밤", category: "문학/창작", description: "단편 소설, 시, 에세이 합평" },
  { slug: "devtalk", name: "데브톡 - 개발자 수다방", category: "컴퓨터/통신", description: "개발 이야기, 취업, 사이드 프로젝트" },
  { slug: "pcbuild", name: "조립PC 연구소", category: "컴퓨터/통신", description: "견적 문의, 부품 리뷰" },
  { slug: "campinglife", name: "캠핑 라이프", category: "스포츠/레저", description: "캠핑장 후기, 장비 리뷰" },
  { slug: "runningcrew", name: "러닝크루 서울", category: "스포츠/레저", description: "주말 러닝 모임" },
  { slug: "football-mania", name: "풋볼매니아", category: "스포츠/레저", description: "해외 축구 이야기" },
  { slug: "dogdaily", name: "강아지 일상", category: "반려동물/동물", description: "강아지 사진, 훈련, 건강 정보" },
  { slug: "catcafe", name: "고양이 집사 모임", category: "반려동물/동물", description: "집사들의 수다" },
  { slug: "starlight-fans", name: "별빛 팬카페", category: "팬카페", description: "가수 별빛 공식 팬카페", isPublic: false },
  { slug: "hobby-crafts", name: "손으로 만드는 취미", category: "취미", description: "뜨개, 가죽공예, 목공" },
  { slug: "photo-walk", name: "사진 산책", category: "문화/예술", description: "출사 모임과 사진 리뷰" },
  { slug: "fashion-talk", name: "패션 토크", category: "패션/미용", description: "데일리룩, 브랜드 세일 정보" },
  { slug: "beauty-lab", name: "뷰티 랩", category: "패션/미용", description: "화장품 리뷰, 피부 고민" },
  { slug: "haneul-high-05", name: "하늘고 05학번 동창회", category: "동창/동문", description: "동창 모임 공지", isPublic: false },
  { slug: "game-lounge", name: "게임 라운지", category: "게임", description: "PC/콘솔 게임 공략과 소식" },
  { slug: "travel-free", name: "자유여행 떠나기", category: "여행", description: "항공권 특가, 여행 후기" },
  { slug: "moneytalk", name: "짠테크 모임", category: "경제/금융", description: "절약, 재테크, 알뜰 소비" },
];

const BOARD_SETS = [
  ["공지사항", "자유게시판", "질문답변", "정보공유", "가입인사"],
  ["공지사항", "자유게시판", "가입인사"],
  ["공지사항", "자유게시판", "질문답변", "가입인사"],
  ["공지사항", "정보공유", "자유게시판", "후기", "가입인사"],
];

const TITLE_TEMPLATES: Record<string, string[]> = {
  "자유게시판": ["오늘 {topic} 어떠셨나요?", "{topic} 관련해서 궁금한 점", "요즘 {topic} 때문에 고민입니다", "{topic} 추천 부탁드려요", "{topic} 후기 남깁니다", "드디어 {topic} 성공했어요!", "{topic} 이거 정상인가요?", "주말에 {topic} 하실 분"],
  "질문답변": ["{topic} 초보 질문입니다", "{topic} 할 때 주의할 점이 있을까요?", "{topic} 어떤 게 더 나을까요?", "{topic} 문제 해결 방법 아시는 분"],
  "정보공유": ["[정보] {topic} 총정리", "{topic} 꿀팁 공유합니다", "{topic} 가격 비교해봤어요", "{topic} 체크리스트"],
  "후기": ["{topic} 솔직 후기", "{topic} 3개월 사용기", "{topic} 다녀왔습니다"],
  "가입인사": ["안녕하세요, 새로 가입했습니다", "가입인사 드립니다!", "잘 부탁드려요 :)", "{topic} 좋아해서 가입했어요"],
  "공지사항": ["[공지] 카페 이용 규칙 안내", "[공지] 11월 정기 모임 안내", "[공지] 게시판 정리 안내", "[공지] 등업 기준 안내"],
};

const TOPICS: Record<string, string[]> = {
  "만화/애니": ["신작 웹툰", "완결 애니", "굿즈 구매", "작화 비교", "성우 라인업"],
  "생활": ["세탁기 청소", "식비 절약", "수납 정리", "주방 가전", "전기요금"],
  "지역": ["동네 맛집", "학원 정보", "주차 문제", "장터", "병원 추천"],
  "외국어": ["쉐도잉", "단어 암기", "회화 스터디", "시험 접수", "문법 정리"],
  "종교/봉사": ["연탄 봉사", "급식 봉사", "헌혈", "기부 캠페인"],
  "교육": ["모의고사", "인강 추천", "스터디 모집", "교재 선택", "학습 계획"],
  "음악": ["공연 티켓", "장비 세팅", "연습 루틴", "커버 영상", "플레이리스트"],
  "건강/다이어트": ["식단 인증", "체중 정체기", "홈트 루틴", "단백질 보충제", "러닝 기록"],
  "문학/창작": ["단편 합평", "시 한 편", "퇴고", "공모전", "글감"],
  "컴퓨터/통신": ["그래픽카드 견적", "코딩 테스트", "사이드 프로젝트", "모니터 추천", "리눅스 설정"],
  "스포츠/레저": ["캠핑 장비", "주말 러닝", "경기 결과", "텐트 추천", "트레킹 코스"],
  "반려동물/동물": ["사료 추천", "배변 훈련", "건강검진", "산책 코스", "장난감"],
  "팬카페": ["콘서트 후기", "앨범 예약", "응원봉", "팬미팅", "굿즈 나눔"],
  "취미": ["뜨개 패턴", "가죽 공예", "목공 도구", "완성작 자랑", "재료 구매"],
  "문화/예술": ["출사 모임", "전시 후기", "필름 카메라", "보정 팁", "촬영 장소"],
  "패션/미용": ["데일리룩", "세일 정보", "피부 고민", "신상 립", "코디 추천"],
  "동창/동문": ["동창회 모임", "근황 공유", "회비 안내", "단체 사진"],
  "게임": ["신작 게임", "공략", "패치 노트", "파티 모집", "그래픽 설정"],
  "여행": ["항공권 특가", "숙소 예약", "환전", "여행 일정", "짐 싸기"],
  "경제/금융": ["적금 금리", "알뜰폰 요금", "카드 혜택", "가계부", "중고 거래"],
};

const BODY_LINES = [
  "안녕하세요. 카페 회원 여러분 덕분에 많은 도움 받고 있어요.",
  "제 경험을 간단히 정리해서 공유드립니다.",
  "첫째, 미리 준비하는 게 중요합니다. 둘째, 꾸준함이 답입니다.",
  "혹시 더 좋은 방법 아시는 분은 댓글로 알려주세요.",
  "사진은 다음에 정리해서 올릴게요. 읽어주셔서 감사합니다!",
  "요약하자면 가격 대비 만족도가 높았고, 다음에도 또 이용할 것 같아요.",
];

const COMMENTS = [
  "좋은 정보 감사합니다!", "저도 궁금했는데 도움이 됐어요.", "오 축하드려요 👏", "이거 저도 해봤는데 괜찮더라고요.",
  "자세한 후기 기다릴게요~", "질문 있는데 쪽지 드려도 될까요?", "공감합니다.", "북마크 해둡니다.", "다음 모임 때 뵈어요!",
];

export function seedCafe(db: DatabaseSync) {
  // 회원별 좋아요 기록 (schema.ts 수정 대신 여기서 멱등 생성)
  db.exec(`CREATE TABLE IF NOT EXISTS cafe_post_likes (
    post_id INTEGER NOT NULL REFERENCES cafe_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
  );`);
  if (!isEmpty(db, "cafes")) return;
  const r = rng(20261102);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];

  const insCafe = db.prepare("INSERT INTO cafes (slug, name, description, category, region, owner_id, color, is_public, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insMember = db.prepare("INSERT OR IGNORE INTO cafe_members (cafe_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)");
  const insBoard = db.prepare("INSERT INTO cafe_boards (cafe_id, name, sort, members_only) VALUES (?, ?, ?, ?)");
  const insPost = db.prepare("INSERT INTO cafe_posts (cafe_id, board_id, user_id, title, content, views, likes, is_notice, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insComment = db.prepare("INSERT INTO cafe_comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)");
  const insLike = db.prepare("INSERT OR IGNORE INTO cafe_post_likes (post_id, user_id) VALUES (?, ?)");
  const insReq = db.prepare("INSERT INTO cafe_join_requests (cafe_id, user_id, message, status, created_at) VALUES (?, ?, ?, 'pending', ?)");

  CAFES.forEach((c, i) => {
    const ownerId = (i % 6) + 1;
    const color = PALETTE[i % PALETTE.length];
    const created = minutesAgo(60 * 24 * (30 + Math.floor(r() * 700)));
    const cafeId = Number(insCafe.run(c.slug, c.name, c.description, c.category, c.region ?? null, ownerId, color, c.isPublic === false ? 0 : 1, created).lastInsertRowid);
    insMember.run(cafeId, ownerId, "owner", created);
    // 멤버: 1~4명 추가, 그중 한 명은 staff
    const others = [1, 2, 3, 4, 5, 6].filter((u) => u !== ownerId).sort(() => r() - 0.5).slice(0, 1 + Math.floor(r() * 4));
    others.forEach((u, k) => insMember.run(cafeId, u, k === 0 ? "staff" : "member", minutesAgo(60 * 24 * Math.floor(r() * 300))));
    const members = [ownerId, ...others];
    // 게시판
    const boardNames = BOARD_SETS[i % BOARD_SETS.length];
    const boardIds = boardNames.map((name, k) => Number(insBoard.run(cafeId, name, k, name === "가입인사" ? 0 : 0).lastInsertRowid));
    // 글: 카페당 5~9개
    const topics = TOPICS[c.category] ?? TOPICS["생활"];
    const n = 5 + Math.floor(r() * 5);
    for (let p = 0; p < n; p++) {
      const bIdx = p === 0 ? 0 : 1 + Math.floor(r() * (boardNames.length - 1));
      const bName = boardNames[bIdx];
      const tmpl = pick(TITLE_TEMPLATES[bName] ?? TITLE_TEMPLATES["자유게시판"]);
      const title = tmpl.replace("{topic}", pick(topics));
      const content = [pick(BODY_LINES), pick(BODY_LINES), pick(BODY_LINES)].join("\n\n");
      const authorId = bName === "공지사항" ? ownerId : pick(members);
      const views = Math.floor(r() * 3000);
      const createdAt = minutesAgo(Math.floor(r() * 60 * 24 * 20));
      const postId = Number(insPost.run(cafeId, boardIds[bIdx], authorId, title, content, views, 0, bName === "공지사항" ? 1 : 0, createdAt).lastInsertRowid);
      // 좋아요
      const likers = [1, 2, 3, 4, 5, 6].filter(() => r() < 0.4);
      likers.forEach((u) => insLike.run(postId, u));
      db.prepare("UPDATE cafe_posts SET likes = ? WHERE id = ?").run(likers.length + Math.floor(r() * 400 * (views / 3000)), postId);
      // 댓글 0~5
      const cn = Math.floor(r() * 6);
      for (let k = 0; k < cn; k++) insComment.run(postId, pick([1, 2, 3, 4, 5, 6]), pick(COMMENTS), minutesAgo(Math.floor(r() * 60 * 24 * 5)));
    }
    // 비공개 카페 가입 신청
    if (c.isPublic === false) {
      const nonMembers = [1, 2, 3, 4, 5, 6].filter((u) => !members.includes(u)).slice(0, 2);
      nonMembers.forEach((u) => insReq.run(cafeId, u, "가입하고 싶습니다. 잘 부탁드려요!", minutesAgo(Math.floor(r() * 60 * 48))));
    }
  });
}
