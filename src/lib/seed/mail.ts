import type { DatabaseSync } from "node:sqlite";
import { isEmpty, minutesAgo, rng } from "./index";

const SUBJECTS = [
  ["Dayver 카페 가입 승인 안내", "안녕하세요. 신청하신 카페 가입이 승인되었습니다. 카페 홈에서 새 글을 확인해 보세요."],
  ["이번 주말 라이딩 모임 공지", "토요일 오전 8시 강변 공원 입구에서 출발합니다. 헬멧과 물 꼭 챙겨 오세요!"],
  ["[Dayver 쇼핑] 주문이 접수되었습니다", "주문하신 상품이 정상 접수되었습니다. 배송이 시작되면 다시 안내드리겠습니다."],
  ["블로그 챌린지 진행 상황 공유", "이번 달 글 7개 썼어요. 3개만 더 쓰면 배지 받을 수 있을 것 같아요. 같이 힘내요."],
  ["신간 리뷰 원고 초안 보냅니다", "말씀하신 신간 리뷰 초안을 첨부 대신 본문에 붙입니다. 의견 주시면 반영할게요.\n\n1. 서론\n2. 주요 내용\n3. 총평"],
  ["다음 달 스토어 프로모션 일정", "11월 둘째 주에 멤버십 적립 프로모션이 예정되어 있습니다. 상품 등록 마감은 금요일입니다."],
  ["뉴스 구독 설정이 변경되었습니다", "구독 중인 언론사 목록이 업데이트되었습니다. MY 뉴스에서 확인할 수 있습니다."],
  ["점심 같이 드실래요?", "내일 12시에 회사 앞 국수집 어떠세요? 새로 생긴 곳인데 평이 좋더라고요."],
  ["회의록: 11월 1주차", "참석: 전원\n결정: 메인 개편 일정 확정, 검색 자동완성 개선 착수\n다음 회의: 다음 주 월요일"],
  ["사진 공유합니다", "지난 주말 캠핑 사진이에요. 다음에 같이 가요!"],
  ["[Dayver] 비밀번호 변경 안내", "최근 비밀번호가 변경되었습니다. 본인이 아니라면 고객센터로 문의해 주세요."],
  ["카페 운영진 초대", "운영진으로 함께해 주실 수 있을까요? 게시판 관리 권한을 드리려고 합니다."],
  ["할머니 김장 레시피 정리본", "말씀드린 레시피를 정리해서 보냅니다. 소금은 천일염 기준이에요."],
  ["이웃 추가 감사합니다", "블로그 이웃 추가해 주셔서 감사해요. 자주 소통해요 :)"],
  ["[광고] 겨울 신상 10% 할인 쿠폰", "지금 Dayver 쇼핑에서 겨울 신상품을 10% 할인된 가격으로 만나보세요."],
];

export function seedMail(db: DatabaseSync) {
  if (!isEmpty(db, "mails")) return;
  const r = rng(7);
  const ins = db.prepare(
    `INSERT INTO mails (from_user_id, to_user_id, subject, body, read_at, starred_by_receiver, folder, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  // 환영 메일 (dayver → 모든 사용자)
  for (let uid = 1; uid <= 6; uid++) {
    const when = minutesAgo(60 * 24 * 20);
    ins.run(
      1, uid,
      "Dayver에 오신 것을 환영합니다",
      "안녕하세요, Dayver 메일입니다.\n\n이제 @dayver.com 주소로 다른 Dayver 사용자와 메일을 주고받을 수 있습니다. 받는사람 입력란에 아이디를 적으면 자동완성이 도와드립니다.\n\n즐거운 하루 보내세요.",
      uid === 2 ? null : when, 0, "inbox", when,
    );
  }
  // 사용자 간 메일
  let i = 0;
  for (let k = 0; k < 36; k++) {
    const [subject, body] = SUBJECTS[k % SUBJECTS.length];
    const from = Math.floor(r() * 6) + 1;
    let to = Math.floor(r() * 6) + 1;
    if (to === from) to = (to % 6) + 1;
    const minutes = Math.floor(r() * 60 * 24 * 18) + 5;
    const unread = r() < 0.3;
    const starred = r() < 0.15 ? 1 : 0;
    const spam = subject.startsWith("[광고]") ? "spam" : "inbox";
    ins.run(from, to, subject, body, unread ? null : minutesAgo(minutes - 3), starred, spam, minutesAgo(minutes));
    i++;
  }
  void i;
  // 임시보관함
  const draft = db.prepare("INSERT INTO mail_drafts (user_id, to_address, subject, body, updated_at) VALUES (?, ?, ?, ?, ?)");
  draft.run(2, "minsu@dayver.com", "라이딩 코스 제안", "다음 주 코스는 강변 북쪽 40km 어떨까요?", minutesAgo(90));
  draft.run(2, "", "", "메모처럼 쓰다 만 메일", minutesAgo(60 * 24 * 2));
  draft.run(3, "haru@dayver.com", "캠핑 장비 목록", "텐트, 랜턴, 버너, 의자 2개", minutesAgo(600));
}
