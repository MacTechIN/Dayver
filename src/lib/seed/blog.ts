import type { DatabaseSync } from "node:sqlite";
import { isEmpty, minutesAgo, PALETTE, rng } from "./index";

import { BLOG_CATEGORIES } from "../blog-categories";

const TITLES: Record<string, string[]> = {
  "만화·애니": [
    "이번 분기 신작 애니 1화 감상 정리",
    "웹툰 '달빛 서점' 완결 후기 (스포 없음)",
    "만화책 책장 정리하다가 발견한 보물들",
    "애니메이션 OST 추천 10곡",
    "코믹 마켓 다녀온 이야기",
    "작화가 미친 장면 모음 (개인 취향)",
    "완결 작품 다시 읽기 챌린지 1주차",
    "피규어 도색 입문 도구 정리",
    "만화 속 요리 따라 만들기: 카레 편",
    "올해의 애니 베스트 5 중간 결산",
    "애니 성우 인터뷰 번역해봤어요",
    "주말에 정주행한 작품 솔직 후기",
  ],
  취미: [
    "방탈출 일지 37: 밀실의 시계공",
    "클라이밍 3개월차, 손가락이 달라졌다",
    "빵지순례 코스 추천 (동네 빵집 5곳)",
    "원데이 클래스로 배운 도자기 그릇",
    "주말 캠핑 장비 리스트 점검",
    "홈카페 라떼아트 연습 기록",
    "자전거 라이딩 코스 공유: 강변 40km",
    "보드게임 모임 후기, 신작 3종",
    "필름 카메라 현상 결과 공개",
    "뜨개질로 만든 겨울 머플러",
    "러닝 10km 완주 기록과 팁",
    "실내 데이트 코스 추천 5가지",
  ],
  "비즈니스·경제": [
    "11월 가계부 결산: 식비가 줄었다",
    "주식 팔면 다음 날 입금? 결제일 변경 정리",
    "소상공인 온라인 스토어 운영 3개월 회고",
    "월급쟁이 ETF 적립식 투자 1년",
    "프리랜서 세금 신고 체크리스트",
    "중고 거래로 모은 종잣돈 이야기",
    "카페 창업 비용 실제 정산표",
    "부동산 청약 공부 노트 1편",
    "환율이 오르면 내 지갑은?",
    "스마트스토어 상세페이지 개선 전후",
    "연말정산 미리 준비하기",
    "구독 서비스 정리하고 절약한 금액",
  ],
  "패션·미용": [
    "가을 코트 3종 비교 착용샷",
    "무채색 겨울옷에 포인트 주는 법",
    "건성 피부 보습 루틴 (저자극)",
    "올해 유행한 립 컬러 정리",
    "운동화 세탁 꿀팁 3가지",
    "미니 토트백 데일리 코디",
    "헤어 트리트먼트 솔직 비교",
    "출근룩 일주일 기록",
    "선크림 바르는 순서 정리",
    "향수 레이어링 조합 추천",
    "겨울 니트 보관법",
    "염색 후 관리 루틴",
  ],
  "일상·생각": [
    "4수생 공시일기 (34)",
    "아 11월이다, 올해가 두 달 남았다",
    "퇴근길에 본 노을 한 장",
    "동네 산책로에서 만난 고양이",
    "오늘의 작은 성취: 이불 개기",
    "비 오는 날의 독서",
    "친구와의 오랜만의 저녁",
    "휴대폰 없이 보낸 하루",
    "새벽 기상 30일 도전 결과",
    "집 앞 은행나무가 노랗게 물들었다",
    "할머니의 김장 레시피",
    "이사 준비 체크리스트",
  ],
  상품리뷰: [
    "무선 청소기 6개월 사용 후기",
    "로봇 물걸레 솔직 리뷰",
    "가성비 기계식 키보드 비교",
    "전기포트 3종 끓는 속도 테스트",
    "겨울 전기요 전기세 실측",
    "노트북 거치대 추천 (목 건강)",
    "캡슐 커피머신 1년 사용기",
    "공기청정기 필터 교체 주기",
    "텀블러 보온력 비교 실험",
    "블루투스 이어폰 통화 품질 비교",
    "에어프라이어 레시피 10선",
    "스탠드 조명 눈 피로도 비교",
  ],
  "육아·결혼": [
    "아이 첫 등원 적응기",
    "신혼집 수납 아이디어",
    "유아 간식 만들기: 고구마 말랭이",
    "결혼 준비 예산표 공개",
    "육아휴직 6개월 회고",
    "아이와 함께 간 과학관",
    "둘째 임신 준비 기록",
    "장난감 정리 습관 들이기",
    "주말 가족 나들이 코스",
    "아이 그림책 추천 리스트",
    "부부 가사 분담표 만들기",
    "돌잔치 준비 타임라인",
  ],
};

const PARA = [
  "오늘은 오래 미뤄두었던 이야기를 정리해 봅니다. 사진은 직접 찍은 것이고, 내용은 개인 경험 기준이라 참고만 해주세요.",
  "처음에는 막막했는데 하나씩 해보니 생각보다 할 만했습니다. 중간중간 실패한 부분도 같이 적어둡니다.",
  "결론부터 말하면 만족합니다. 다만 아래 몇 가지는 미리 알고 시작했으면 좋았을 것 같아요.",
  "비슷한 고민을 하는 분들께 조금이라도 도움이 되면 좋겠습니다. 궁금한 점은 댓글로 남겨주세요.",
  "다음 글에서는 이어지는 내용을 더 자세히 다뤄볼 예정입니다. 공감과 이웃추가는 큰 힘이 됩니다.",
];

const COMMENTS = [
  "좋은 글 잘 읽었어요!",
  "저도 비슷한 경험이 있어서 공감됩니다.",
  "사진 너무 예쁘네요 ㅎㅎ",
  "다음 편도 기대할게요.",
  "정보 감사합니다. 저장해둘게요.",
  "이웃 신청하고 갑니다~",
];

export function seedBlog(db: DatabaseSync) {
  if (!isEmpty(db, "blog_posts")) return;
  const r = rng(20261102);
  const insPost = db.prepare(
    `INSERT INTO blog_posts (user_id, title, content, category, tags, image_color, is_public, likes, views, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?)`,
  );
  const insComment = db.prepare("INSERT INTO blog_comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)");
  const insLike = db.prepare("INSERT OR IGNORE INTO blog_likes (post_id, user_id) VALUES (?, ?)");
  const insNeighbor = db.prepare("INSERT OR IGNORE INTO blog_neighbors (user_id, neighbor_id) VALUES (?, ?)");

  const postIds: number[] = [];
  let order = 0;
  for (const cat of BLOG_CATEGORIES) {
    const titles = TITLES[cat];
    titles.forEach((title) => {
      const userId = (order % 6) + 1;
      const paras = [PARA[Math.floor(r() * PARA.length)], PARA[Math.floor(r() * PARA.length)], PARA[Math.floor(r() * PARA.length)]];
      const content = `${title}\n\n${paras.join("\n\n")}`;
      const tags = `${cat.split("·")[0]},${title.split(" ")[0]}`;
      const minutes = Math.floor(r() * 60 * 24 * 14) + 10; // 최근 2주
      const when = minutesAgo(minutes);
      const views = Math.floor(r() * 2500);
      const color = PALETTE[Math.floor(r() * PALETTE.length)];
      const res = insPost.run(userId, title, content, cat, tags, color, views, when, when);
      postIds.push(Number(res.lastInsertRowid));
      order++;
    });
  }

  // 공감
  for (const pid of postIds) {
    const n = Math.floor(r() * 5);
    const likers = new Set<number>();
    for (let k = 0; k < n; k++) likers.add(Math.floor(r() * 6) + 1);
    for (const uid of likers) insLike.run(pid, uid);
    db.prepare("UPDATE blog_posts SET likes = ? WHERE id = ?").run(likers.size + Math.floor(r() * 150), pid);
  }
  // 댓글
  for (const pid of postIds) {
    const n = Math.floor(r() * 4);
    for (let k = 0; k < n; k++) {
      insComment.run(pid, Math.floor(r() * 6) + 1, COMMENTS[Math.floor(r() * COMMENTS.length)], minutesAgo(Math.floor(r() * 60 * 24 * 7)));
    }
  }
  // 이웃
  const pairs: Array<[number, number]> = [
    [2, 3], [2, 4], [2, 1], [3, 2], [3, 5], [4, 2], [4, 6], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [5, 2], [6, 4],
  ];
  for (const [a, b] of pairs) insNeighbor.run(a, b);
}
