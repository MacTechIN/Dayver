import type { DatabaseSync } from "node:sqlite";
import { isEmpty, PALETTE, minutesAgo, rng } from "./index";

/** 메인 '추천 관심사' 피드 시드 (네이버 PC-FEED-WRAPPER 블록 재해석) */
const FEED: Record<string, Array<{ title: string; source: string; kind?: "post" | "video" | "news"; duration?: string }>> = {
  추천: [
    { title: "하루 10분, 집에서 하는 허리 스트레칭 5가지", source: "하루건강 블로그", kind: "video", duration: "00:34" },
    { title: "11월 제철 식재료로 만드는 저녁 메뉴 7선", source: "리빙푸드 에디터" },
    { title: "첫 차 구매 전 꼭 확인할 체크리스트", source: "카테크 가이드" },
    { title: "올해 가장 많이 읽힌 신간 베스트 20", source: "데이버 책방" },
    { title: "초보 캠퍼를 위한 난로 고르기", source: "캠핑 라이프 카페" },
    { title: "겨울 피부 보습, 순서가 중요합니다", source: "뷰티 노트", kind: "video", duration: "00:29" },
    { title: "주말 당일치기 단풍 명소 12곳", source: "여행하는 하루" },
    { title: "집에서 직접 만드는 수제 그래놀라", source: "홈베이킹 일지" },
  ],
  카테크: [
    { title: "전기차 겨울철 주행거리 줄어드는 이유와 대처법", source: "카테크 가이드" },
    { title: "타이어 교체 시기, 마모 한계선 보는 법", source: "정비사의 노트", kind: "video", duration: "00:48" },
    { title: "블랙박스 고를 때 화질보다 중요한 것", source: "자동차 리뷰" },
    { title: "신차 출고 대기 줄이는 팁 5가지", source: "하루 모빌리티" },
    { title: "올해 가장 많이 팔린 SUV 순위", source: "데이버 자동차" },
    { title: "셀프 세차, 순서만 지켜도 다릅니다", source: "세차장 일기", kind: "video", duration: "00:55" },
  ],
  웹툰: [
    { title: "[신작] 월요일의 마법사 1화 공개", source: "데이버 웹툰" },
    { title: "이번 주 요일별 인기 웹툰 TOP 10", source: "데이버 웹툰" },
    { title: "완결 추천: 밤의 도서관 전편 몰아보기", source: "웹툰 큐레이션" },
    { title: "작가 인터뷰: '바람의 골목' 작화 비하인드", source: "웹툰 매거진" },
    { title: "베스트 도전 이달의 신인 작가", source: "데이버 웹툰" },
    { title: "웹소설 원작 드라마화 소식 모음", source: "시리즈 뉴스" },
  ],
  패션뷰티: [
    { title: "26FW 아우터 트렌드: 숏 패딩 vs 롱 코트", source: "패션 에디터" },
    { title: "겨울 니트 보관법, 늘어나지 않게", source: "옷장 정리 노트" },
    { title: "쿨톤·웜톤별 립 컬러 추천", source: "뷰티 노트", kind: "video", duration: "00:41" },
    { title: "데일리 백팩 추천 BEST 7", source: "가방 리뷰" },
    { title: "향수 레이어링 입문 가이드", source: "퍼퓸 다이어리" },
    { title: "운동화 세탁, 집에서 새것처럼", source: "리빙 팁" },
  ],
  리빙푸드: [
    { title: "김장철 배추 고르는 법", source: "리빙푸드 에디터" },
    { title: "에어프라이어로 20분 만에 끝내는 저녁", source: "집밥 연구소", kind: "video", duration: "00:37" },
    { title: "작은 방 넓어 보이게 하는 가구 배치", source: "인테리어 노트" },
    { title: "겨울 난방비 아끼는 창문 단열 팁", source: "하루 리빙" },
    { title: "홈카페 드립백 추천 5종", source: "커피 다이어리" },
    { title: "주방 수납, 서랍 하나로 끝내기", source: "정리 수납 카페" },
  ],
  책방: [
    { title: "11월 신간: 느리게 걷는 사람들", source: "데이버 책방" },
    { title: "베스트셀러 TOP 20 (11월 1주)", source: "데이버 책방" },
    { title: "에디터 추천: 겨울밤에 읽기 좋은 에세이", source: "책방 에디터" },
    { title: "독서모임 운영 노하우", source: "책읽는 카페" },
    { title: "그림책으로 시작하는 아이 독서 습관", source: "육아 서재" },
    { title: "올해의 과학책 후보작 소개", source: "지식 매거진" },
  ],
  지식: [
    { title: "생성형 AI 용어 10분 정리", source: "코드타임즈" },
    { title: "직장인을 위한 엑셀 함수 베스트 12", source: "오피스 강의", kind: "video", duration: "00:52" },
    { title: "경제 지표 읽는 법: 금리와 환율", source: "데이버 지식" },
    { title: "역사 속 오늘: 11월의 사건들", source: "역사 산책" },
    { title: "영어 회화, 매일 5문장 챌린지", source: "하루 영어" },
    { title: "부동산 계약 전 확인할 서류", source: "생활 법률" },
  ],
  건강: [
    { title: "손에 이런 증상, 혈액순환 신호 3가지", source: "하루건강 블로그", kind: "video", duration: "00:34" },
    { title: "매년 엑스레이만 찍으셨다면? 검진 항목 다시 보기", source: "메디 노트", kind: "video", duration: "00:29" },
    { title: "뱃살 없는 탄탄한 복부, 플랭크 바로 알기", source: "홈트 코치", kind: "video", duration: "00:10" },
    { title: "환절기 면역력, 수면 시간이 답입니다", source: "건강 매거진" },
    { title: "30대 운동 루틴: 주 3회로 충분한가", source: "피트니스 일지" },
    { title: "당 줄이는 식단, 일주일 실천기", source: "식단 기록" },
  ],
};

export function seedMain(db: DatabaseSync) {
  if (!isEmpty(db, "feed_items")) return;
  const r = rng(77);
  const ins = db.prepare(
    "INSERT INTO feed_items (tab, kind, title, source, link, image_color, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  let i = 0;
  for (const [tab, items] of Object.entries(FEED)) {
    for (const it of items) {
      const color = PALETTE[Math.floor(r() * PALETTE.length)];
      ins.run(tab, it.kind ?? "post", it.title, it.source, `/search?query=${encodeURIComponent(it.title.slice(0, 12))}`, color, it.duration ?? null, minutesAgo(20 + i * 37));
      i++;
    }
  }
}
