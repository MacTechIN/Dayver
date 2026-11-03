import type { DatabaseSync } from "node:sqlite";
import { isEmpty, rng, PALETTE } from "./index";

/**
 * Dayver 쇼핑 시드. shopping.naver.com/ns/home 관측(카테고리 27개, 전문관 매핑,
 * 숏컷 3그룹, 오늘의 행사 12건, 오늘끝딜 타이머 카드, 스토어 큐레이션)을 허구 데이터로 재해석.
 */

type CatSpec = { name: string; children: string[]; vertical?: string; items: string[]; price: [number, number] };

const CATEGORIES: CatSpec[] = [
  { name: "여성의류", vertical: "fashion_town", children: ["공식몰단독", "상의", "팬츠/스커트", "아우터", "원피스", "수트/셋업", "니트/가디건", "트레이닝복"], items: ["울 혼방 코트", "캐시미어 니트", "플리츠 스커트", "하이웨스트 와이드 팬츠", "트위드 자켓", "롱 패딩", "셔츠 원피스", "크롭 가디건"], price: [19000, 259000] },
  { name: "남성의류", vertical: "fashion_town", children: ["편집샵", "상의", "팬츠", "셋업", "아우터", "트레이닝복", "셔츠", "정장"], items: ["오버핏 맨투맨", "테이퍼드 슬랙스", "헤비 후드", "숏 패딩", "울 코트", "옥스포드 셔츠", "트레이닝 셋업", "경량 다운 베스트"], price: [15000, 229000] },
  { name: "패션잡화", vertical: "fashion_town", children: ["여성가방", "남성가방", "여행용가방/소품", "주얼리", "모자", "벨트", "지갑", "스카프", "양말", "안경/선글라스", "시계", "장갑", "머플러"], items: ["미니 토트백", "크로스백", "캐리어 20인치", "실버 체인 목걸이", "울 비니", "가죽 벨트", "카드 지갑", "캐시미어 머플러"], price: [8900, 189000] },
  { name: "신발", vertical: "fashion_town", children: ["운동화/스니커즈", "여성단화", "힐/펌프스", "남성구두", "슬리퍼/샌들", "부츠", "워커", "실내화", "기능화", "아동화", "신발용품", "레인부츠"], items: ["데일리 스니커즈", "첼시 부츠", "로퍼", "러닝화", "앵클 부츠", "슬립온", "어그 스타일 부츠", "방한 슬리퍼"], price: [12900, 199000] },
  { name: "화장품/미용", vertical: "beauty", children: ["스킨케어", "선케어", "마스크/팩", "클렌징", "메이크업", "헤어케어", "바디케어", "향수", "네일", "남성화장품", "뷰티소품", "이너뷰티", "미용기기", "유아화장품"], items: ["비건 톤업 선크림", "수분 크림", "클렌징 밤", "쿠션 파운데이션", "립 틴트", "두피 샴푸", "바디 로션", "앰플 세럼"], price: [6900, 89000] },
  { name: "신선식품", vertical: "market", children: ["과일", "채소", "쌀/잡곡", "견과류", "건과류", "계란/알류", "수산물", "축산물", "김치", "반찬", "두부/콩나물", "버섯"], items: ["제철 사과 3kg", "샤인머스캣 2kg", "한우 등심 500g", "무항생제 특란 20구", "국산 생나또 24팩", "절임배추 20kg", "생연어 필렛", "무농약 대파"], price: [3900, 129000] },
  { name: "가공식품", vertical: "market", children: ["생수/탄산수", "커피/차류", "음료", "우유/두유/요거트", "치즈/유가공품", "밀키트", "라면/면류", "통조림", "간편식", "과자/간식", "빵/떡", "조미료", "냉동식품", "잼/시럽", "건강음료", "소스", "식용유"], items: ["원팩 마라탕 밀키트", "생수 2L 12병", "아몬드 음료 24팩", "드립백 커피 30개입", "컵라면 24입", "두바이 쫀득떡 3개", "그릭 요거트 10개", "미니 약과 선물세트"], price: [2900, 59000] },
  { name: "건강식품", children: ["비타민", "프로바이오틱스", "오메가3", "영양제", "단백질보충제", "홍삼", "콜라겐", "다이어트식품", "루테인", "마그네슘", "밀크씨슬", "건강즙", "꿀", "효소", "영양바", "유아영양제", "반려동물영양제"], items: ["프로바이오틱스 캡슐 120개", "비타민D 2000IU", "rTG 오메가3", "홍삼 스틱 30포", "저분자 콜라겐", "단백질 쉐이크 1kg", "루테인 지아잔틴", "마그네슘 글리시네이트"], price: [9900, 159000] },
  { name: "출산/유아동", children: ["유아동의류", "유아동신발/가방", "기저귀", "분유/이유식", "수유용품", "유아동가구", "카시트", "유모차", "완구", "유아동침구", "유아식기", "목욕용품", "외출용품", "안전용품", "임부복", "유아동잡화", "교구", "물티슈", "유아동도서", "신생아용품", "유아동수영복", "유아동한복", "장난감", "블록", "인형", "유아동양말", "유아동내의", "보행기", "젖병소독기"], items: ["넥스트 시스템 카시트 세트", "LED 멀티 수유등", "텐셀 키즈 차렵이불", "유아 물티슈 70매 20팩", "프리미엄 기저귀 4단계", "원목 블록 100p", "유아 스니커즈", "절충형 유모차"], price: [4900, 499000] },
  { name: "반려동물용품", children: ["강아지 사료", "강아지 간식", "강아지 배변용품", "강아지 영양관리", "고양이 사료", "고양이 간식", "고양이 모래", "장난감", "이동장", "급수기", "하우스", "미용용품", "의류", "목줄/하네스", "방석", "스크래쳐", "캣타워", "식기", "영양제", "소형동물", "관상어", "조류"], items: ["연어 사료 6kg", "덴탈 껌 30개", "벤토나이트 모래 10kg", "자동 급수기", "접이식 켄넬", "캣타워 3단", "슬립 하네스 세트", "오리 육포 300g"], price: [4900, 189000] },
  { name: "가전", children: ["TV", "청소기", "냉장고", "세탁기/건조기", "계절가전", "주방가전", "음향가전", "영상가전", "미용가전", "생활가전", "에어컨", "공기청정기"], items: ["1200시리즈 전자동 커피머신", "계란찜기 에그쿠커", "무선 청소기", "4도어 냉장고", "에어프라이어 5.5L", "3in1 에어퍼포머", "로봇청소기", "식기세척기 12인용"], price: [29000, 2990000] },
  { name: "휴대폰/카메라", children: ["휴대폰", "카메라", "웨어러블", "1인방송/촬영", "휴대폰액세서리"], items: ["폴더형 스마트폰 512GB", "무선 이어버드", "미러리스 카메라 바디", "스마트워치 44mm", "짐벌 3축", "고속 충전기 65W", "강화유리 2매", "마그네틱 거치대"], price: [5900, 2290000] },
  { name: "PC/주변기기", children: ["노트북", "브랜드PC", "모니터", "태블릿PC", "PC주변기기", "저장장치", "키보드/마우스", "프린터", "네트워크장비", "PC부품", "소프트웨어", "게이밍기어", "스피커"], items: ["16인치 노트북 16GB 256GB", "태블릿 WiFi 128GB", "27인치 QHD 모니터", "기계식 키보드", "무선 마우스", "NVMe SSD 1TB", "노트북 거치대", "게이밍 헤드셋"], price: [9900, 2490000] },
  { name: "가구", vertical: "high_end", children: ["침대", "매트리스/토퍼", "옷장/행거", "소파", "거실장/테이블", "책상/책장", "식탁/의자", "화장대", "수납장", "선반", "아이책상", "사무용가구", "야외가구", "거울", "현관가구"], items: ["스프링 매트리스 SS", "패브릭 데이베드", "슬라이딩 옷장 1200", "꼼므 아이책상 세트", "3단 칸막이 책장", "원목 식탁 4인", "리클라이너 소파", "LED 화장대"], price: [39000, 1990000] },
  { name: "조명/인테리어", vertical: "high_end", children: ["조명/스탠드", "디퓨저/캔들", "인테리어소품", "시계", "액자/갤러리", "식물/화분", "벽지/시트지", "커튼/블라인드", "러그/카페트"], items: ["포터블 램프", "머쉬룸 우드 스탠드", "리드 디퓨저 200ml", "벽시계 30cm", "갤러리 액자 A3", "풀바른 벽지 단색", "암막 커튼 2장", "단모 러그 150x200"], price: [7900, 329000] },
  { name: "패브릭/홈데코", children: ["침구", "베개/베개커버", "침구커버", "요/패드", "담요", "쿠션", "홈웨어", "수건", "슬리퍼", "발매트", "소파커버", "테이블보", "커튼", "방석", "빈백", "이불솜"], items: ["깊은잠 높이조절 베개", "구스 차렵이불 Q", "극세사 담요", "호텔 수건 10장", "메모리폼 방석", "면 베개커버 2P", "소파 패드", "빈백 소파"], price: [5900, 259000] },
  { name: "주방용품", vertical: "high_end", children: ["프라이팬", "냄비/솥", "도마", "칼", "밀폐용기", "텀블러", "컵/머그", "그릇", "수저", "주방잡화", "조리도구", "커피용품", "보온병", "주전자", "도시락", "식기건조대", "양념통", "행주", "주방수납", "칼갈이", "와인용품", "베이킹용품", "키친타월", "쟁반", "고무장갑"], items: ["고깔손잡이 주물냄비 24cm", "도자기 밥용기 4P", "세라믹 미니 텀블러", "코팅 프라이팬 28cm", "원목 도마 L", "밀폐용기 10종 세트", "핸드드립 세트", "스텐 수저 4인"], price: [4900, 399000] },
  { name: "생활용품", children: ["수납/정리용품", "욕실용품", "목욕용품", "칫솔/치약/가글", "세제", "청소용품", "화장지", "생리대", "방향제", "살충제", "건전지", "우산", "공구함", "빨래용품", "주방세제", "휴지통", "제습제", "쓰레기봉투", "면도기", "손세정제", "구강용품", "탈취제", "마스크"], items: ["만능 클리너 750ml 2개", "쿨민트 가글 1L 2개", "키친타월 130매 6롤", "3겹 화장지 30롤", "스크럽 스펀지 세트", "세탁세제 3L 2개", "제습제 12개", "실리콘 고무장갑"], price: [2900, 49000] },
  { name: "스포츠/레저", children: ["캠핑", "등산/아웃도어", "러닝", "골프", "낚시", "라이딩", "헬스", "요가", "수영", "축구", "야구", "테니스", "스키/보드", "배드민턴"], items: ["경량 텐트 2인", "구스다운 침낭", "러닝 자켓", "골프 드라이버", "요가매트 10mm", "덤벨 세트 20kg", "캠핑 체어", "트레킹 폴"], price: [9900, 899000] },
  { name: "자동차/오토바이", children: ["타이어/휠", "블랙박스", "엔진오일", "세차용품", "카매트", "차량용품", "오토바이용품", "내비게이션", "차량방향제", "휴대폰거치대", "공기청정기", "시트커버", "와이퍼", "배터리", "썬바이저", "트렁크정리함", "방향제", "전동킥보드", "자전거", "주차용품"], items: ["카본 3D 트렁크매트", "무선 안드로이드오토 동글", "합성 엔진오일 5W30 4L", "블랙박스 2채널", "차량용 거치대", "세차 타월 세트", "차량 공기청정기", "스노우 체인"], price: [5900, 399000] },
  { name: "키덜트/취미", children: ["피규어/프라모델", "보드게임", "드론", "R/C", "수집품", "퍼즐", "DIY", "미술용품", "뜨개", "원예", "조립블록"], items: ["오일파스텔 48색", "보드게임 전략편", "미니 드론", "1/144 프라모델", "1000피스 퍼즐", "DIY 미니어처 하우스", "뜨개 키트", "RC 오프로드 카"], price: [6900, 299000] },
  { name: "건강/의료용품", children: ["마스크", "안마/마사지용품", "상처/구급용품", "냉온/찜질용품", "발/다리 건강용품", "혈압계", "체온계", "보호대", "온열기", "안마의자", "눈 건강", "허리 건강", "보청기", "손목보호대", "구급함", "밴드", "파스", "소독용품"], items: ["KF94 마스크 50매", "목 어깨 마사지기", "전자 혈압계", "발목 보호대", "온열 찜질팩", "구급 키트", "무릎 보호대", "안마 쿠션"], price: [3900, 1290000] },
  { name: "악기/문구", children: ["문구/사무용품", "악기", "화방용품", "다이어리", "필기구", "노트"], items: ["사무용 복사지 2500매", "젤펜 12색", "어쿠스틱 기타", "디지털 피아노 88건반", "캔버스 10호", "2027 다이어리", "스케치북 A4", "우쿨렐레"], price: [1900, 1290000] },
  { name: "공구", children: ["안전용품", "전기용품", "전동공구", "수공구", "측정공구", "원예공구", "용접", "에어공구", "작업복", "공구함", "접착제", "볼트/너트", "사다리", "안전화", "장갑", "줄자", "드릴비트", "톱", "페인트"], items: ["충전 드릴 20V", "공구 세트 100p", "레이저 거리 측정기", "안전화 6인치", "작업 장갑 10켤레", "접이식 사다리 4단", "멀티툴", "LED 작업등"], price: [3900, 329000] },
  { name: "렌탈관", children: ["건강가전", "가구/리빙", "생활가전", "계절가전", "스포츠/레저"], items: ["직수 정수기 렌탈", "안마의자 렌탈", "공기청정기 렌탈", "매트리스 렌탈", "비데 렌탈", "의류관리기 렌탈", "식기세척기 렌탈", "전기레인지 렌탈"], price: [19900, 79900] },
  { name: "E쿠폰/티켓/생활편의", children: ["e쿠폰교환권", "원데이클래스", "지류/카드 상품권", "온라인 콘텐츠", "꽃/케이크배달", "자기계발/취미 레슨", "청소/이사", "세탁"], items: ["커피 교환권", "베이킹 원데이클래스", "모바일 상품권 5만원", "온라인 강의 3개월", "꽃다발 당일배달", "홈 클리닝 2시간", "케이크 배달", "영어 회화 1개월"], price: [4500, 150000] },
  { name: "여행", vertical: "travel_hotdeal", children: ["국내여행/체험", "국내숙박", "국내렌터카", "해외여행", "사전예약"], items: ["단풍여행 & 스파 1박", "제주 렌터카 3일", "호텔 숙박권 2인", "온천 입장권", "패키지 여행 4일", "글램핑 1박", "테마파크 자유이용권", "요트 투어 2시간"], price: [15000, 1290000] },
];

const STORES: Array<{ slug: string; name: string; type: "BRAND" | "SMARTSTORE"; desc: string }> = [
  { slug: "harulife", name: "하루리빙", type: "BRAND", desc: "매일의 공간을 바꾸는 리빙 브랜드" },
  { slug: "modernkitchen", name: "모던키친", type: "BRAND", desc: "주방을 위한 프리미엄 도구" },
  { slug: "daygagu", name: "데이가구", type: "BRAND", desc: "침대부터 소파까지, 데이가구" },
  { slug: "biocarmat", name: "바이오카매트", type: "BRAND", desc: "차량 맞춤 3D 트렁크매트 전문" },
  { slug: "carbitna", name: "카빛나", type: "SMARTSTORE", desc: "차량 수납·정리 전문 스토어" },
  { slug: "tparts", name: "티파츠", type: "BRAND", desc: "자동차 액세서리 셀렉트샵" },
  { slug: "kamaru", name: "카마루", type: "BRAND", desc: "카매트 원단 전문" },
  { slug: "automate", name: "오토메이트", type: "SMARTSTORE", desc: "스마트 차량용품" },
  { slug: "greenfarm", name: "그린팜", type: "SMARTSTORE", desc: "산지직송 신선식품" },
  { slug: "dayfresh", name: "데이프레시", type: "BRAND", desc: "새벽배송 마트" },
  { slug: "sunbeauty", name: "선뷰티", type: "BRAND", desc: "비건 스킨케어" },
  { slug: "glowlab", name: "글로우랩", type: "SMARTSTORE", desc: "메이크업 편집샵" },
  { slug: "fitstation", name: "핏스테이션", type: "SMARTSTORE", desc: "홈트와 러닝 용품" },
  { slug: "campday", name: "캠프데이", type: "BRAND", desc: "감성 캠핑 장비" },
  { slug: "techhub", name: "테크허브", type: "BRAND", desc: "노트북·태블릿 공식 판매점" },
  { slug: "pixelstore", name: "픽셀스토어", type: "SMARTSTORE", desc: "PC 주변기기 전문" },
  { slug: "babynest", name: "베이비네스트", type: "BRAND", desc: "출산·육아 필수템" },
  { slug: "petpick", name: "펫픽", type: "SMARTSTORE", desc: "반려동물 간식과 용품" },
  { slug: "cozyhome", name: "코지홈", type: "SMARTSTORE", desc: "침구와 홈데코" },
  { slug: "lightroom", name: "라이트룸", type: "BRAND", desc: "조명과 인테리어 소품" },
  { slug: "healthplus", name: "헬스플러스", type: "BRAND", desc: "건강기능식품 공식몰" },
  { slug: "toolbox", name: "툴박스", type: "SMARTSTORE", desc: "전동공구와 작업용품" },
  { slug: "hobbyroom", name: "하비룸", type: "SMARTSTORE", desc: "취미와 키덜트" },
  { slug: "urbanwear", name: "어반웨어", type: "BRAND", desc: "컨템포러리 패션" },
  { slug: "stepshoes", name: "스텝슈즈", type: "SMARTSTORE", desc: "데일리 슈즈 편집샵" },
];

/** 카테고리 인덱스 → 어울리는 스토어 인덱스 후보 */
const STORE_FOR_CAT: number[][] = [
  [23, 24], [23, 24], [23, 24], [24, 23], [10, 11], [8, 9], [9, 8], [20, 9], [16, 18], [17],
  [14, 0], [14, 15], [14, 15], [2, 0], [19, 0], [18, 0], [1, 0], [0, 9], [12, 13], [3, 4, 5, 6, 7],
  [22], [20, 12], [22, 15], [21], [0, 2], [9, 22], [13],
];

const ADJ = ["프리미엄", "베스트", "NEW", "데일리", "시그니처", "초경량", "클래식", "에코", "슬림", "와이드", "오리지널", "플러스"];
const TAGS: Array<[string, string]> = [
  ["PROMOTION", "데이세일"], ["LOUNGE", "브랜드데이"], ["VOUCHER", "쿠폰"], ["ARRIVAL_GUARANTEE", "도착보장"], ["MEMBERSHIP_EXCLUSIVE", "멤버십 전용"],
];

export function seedShopping(db: DatabaseSync) {
  if (!isEmpty(db, "shop_categories")) return;
  const r = rng(20261102);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const between = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));

  // 카테고리
  const insCat = db.prepare("INSERT INTO shop_categories (id, name, parent_id, sort, vertical_code) VALUES (?, ?, ?, ?, ?)");
  CATEGORIES.forEach((c, i) => {
    const id = 101 + i;
    insCat.run(id, c.name, null, i, c.vertical ?? null);
    c.children.forEach((ch, j) => insCat.run(id * 100 + j + 1, ch, id, j, null));
  });

  // 스토어
  const insCh = db.prepare("INSERT INTO shop_channels (slug, name, service_type, description, color) VALUES (?, ?, ?, ?, ?)");
  STORES.forEach((s, i) => insCh.run(s.slug, s.name, s.type, s.desc, PALETTE[i % PALETTE.length]));

  // 상품 (~300)
  const insP = db.prepare(
    `INSERT INTO shop_products (channel_id, category_id, name, sale_price, discount_rate, image_color, review_count, review_score,
       is_free_delivery, is_today_delivery, is_arrival_guarantee, tag_type, tag_title, stock, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime', ?))`,
  );
  const productIds: number[] = [];
  CATEGORIES.forEach((c, ci) => {
    const topId = 101 + ci;
    const per = ci < 20 ? 12 : 10;
    for (let k = 0; k < per; k++) {
      const item = c.items[k % c.items.length];
      const adj = k >= c.items.length ? `${pick(ADJ)} ` : r() < 0.3 ? `${pick(ADJ)} ` : "";
      const storeIdx = pick(STORE_FOR_CAT[ci]);
      const store = STORES[storeIdx];
      const name = `[${store.name}] ${adj}${item}`;
      const price = Math.round(between(c.price[0], c.price[1]) / 100) * 100;
      const disc = r() < 0.65 ? between(5, 59) : 0;
      const tag = r() < 0.55 ? pick(TAGS) : null;
      const childId = topId * 100 + between(1, c.children.length);
      const res = insP.run(
        storeIdx + 1, childId, name, price, disc, PALETTE[(ci * 7 + k) % PALETTE.length],
        between(0, 12000), Math.round((38 + r() * 12)) / 10,
        r() < 0.8 ? 1 : 0, r() < 0.35 ? 1 : 0, r() < 0.4 ? 1 : 0,
        tag ? tag[0] : null, tag ? tag[1] : null, between(0, 300),
        `${item}. ${store.desc}. 데이버 쇼핑 단독 구성으로 준비했습니다.`,
        `-${between(0, 40)} days`,
      );
      productIds.push(Number(res.lastInsertRowid));
    }
  });

  // 이벤트: 배너 / 오늘의 행사 / 오늘끝딜 / 숏컷
  const insE = db.prepare(
    "INSERT INTO shop_events (kind, label, header, title, subtitle, landing_url, color, product_id, ends_at, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const banners: Array<[string, string, string]> = [
    ["오늘 단 하루! 멤버십 깜짝 특별적립", "데이세일 할인에 적립까지 얹었습니다", "#5e3bee"],
    ["데이세일 새로 나온 신상품 핫딜 PICK!", "자세히 보러 가기", "#4b2fd1"],
    ["리뷰와 판매량이 증명하는 베스트템!", "데이세일 베스트", "#2bb3b1"],
    ["거대한 할인 체급의 IT·노트북 모음", "최신 디바이스 득템은 데이세일이 정답", "#0068c3"],
    ["육아 위시템 데이 청산", "애 키우는 집 필수템 제대로 할인!", "#e8457b"],
    ["무채색 겨울옷에 포인트 하나 필수!", "데이세일 패션", "#34495e"],
    ["엔진오일·필터 최저가로 싹 갈아타자!", "소중한 내 차 환골탈태", "#1f8a70"],
    ["불멍 때리기 좋은 계절 감성 레저템 총집합", "거대한 할인 체급 느낄 준비됐나요?", "#f2a900"],
  ];
  banners.forEach((b, i) => insE.run("BANNER", "데이세일", "", b[0], b[1], `/shopping/category/${101 + ((i * 3) % 27)}`, b[2], productIds[(i * 23) % productIds.length], null, i));

  const todays: Array<[string, string, string]> = [
    ["1+1", "", "비건 워터풀 톤업 선크림 반값"], ["슈퍼적립", "", "올데이 벨티드 맥코트 20% 특가"], ["", "최저가", "모래놀이 세트 20%↓"],
    ["", "24시간만", "밀폐용기 ~71% 세일+쿠폰 지급"], ["오늘끝딜", "", "질 유산균 100주년 기획 핫딜"], ["쇼핑LIVE", "", "아몬드 음료 ~59% 타임 어택!"],
    ["NEW", "", "미니 토트백 40,900원"], ["신상위크", "", "율무 클렌징 브라이트너 최초 론칭"], ["브랜드DAY", "", "데이가구 ~79% 할인+구매왕 사은품"],
    ["N배송", "", "두바이 쫀득떡 3개 1만 원대"], ["", "~69%↓", "주물냄비 전 상품 빅세일"], ["", "단 하루", "스크럽 스펀지 UP TO 55%↓"],
  ];
  todays.forEach((t, i) => insE.run("TODAY_EVENT", t[0], t[1], t[2], "", `/shopping/product/${productIds[(i * 17 + 3) % productIds.length]}`, PALETTE[(i + 2) % PALETTE.length], productIds[(i * 17 + 3) % productIds.length], null, i));

  const today = new Date();
  const p2 = (x: number) => String(x).padStart(2, "0");
  const endsAt = `${today.getFullYear()}-${p2(today.getMonth() + 1)}-${p2(today.getDate())} 23:59:59`;
  const dealTitles = ["만능 클리너 750ml+750ml", "원팩 마라탕 밀키트 1+1", "제로아워 제로 12+12", "소식좌 볶음밥 5종 외 전상품", "풀바른 벽지 단색 셀프도배", "실크 단색 붙이는 도배지", "국물 닭갈비 떡볶이", "무항생제 특란 XL 20구", "직수 정수기 렌탈(30만원 증정)"];
  dealTitles.forEach((t, i) => {
    const pid = productIds[(i * 29 + 7) % productIds.length];
    const membership = i === 6 || i === 7;
    insE.run("DEAL", membership ? "멤버십 전용" : "오늘끝딜", "", t, membership ? "배송비 별도" : "무료배송", `/shopping/product/${pid}`, "#5e3bee", pid, membership ? null : endsAt, i);
  });

  const shortcuts: Array<[string, string, string, string]> = [
    ["데이세일", "선착순 쿠폰 선점하기!", "/shopping/deals", "#5e3bee"], ["데이가구", "침대부터 감성 소파까지!", "/shopping/category/114", "#8e6cf5"],
    ["데이모바일", "핸드폰 바꿀 사람 주목!", "/shopping/category/112", "#0068c3"], ["오늘끝딜", "순대국 1팩 4천원대!", "/shopping/deals", "#ff6f3d"],
    ["데이N마트", "멤버십 2만 원 무료배송", "/shopping/category/106", "#5e3bee"], ["데이취미템", "주말에 뭐할지 걱정 끝!", "/shopping/category/121", "#2bb3b1"],
    ["지금배달", "20% 할인받고 장보기", "/shopping/category/107", "#03c75a"], ["데이멤버십", "단하루 멤버십 특별적립!", "/shopping/my", "#5e3bee"],
    ["데이댕냥템", "펫 용품 특가 떴다!", "/shopping/category/110", "#e8457b"], ["쇼핑라이브", "", "/shopping/best", "#c0392b"],
    ["N배송", "", "/shopping/category/118", "#03c75a"], ["N여행핫딜", "", "/shopping/category/127", "#0068c3"],
    ["슈퍼적립", "", "/shopping/best", "#5e3bee"], ["하이엔드", "", "/shopping/category/114", "#222222"],
  ];
  shortcuts.forEach((s, i) => insE.run("SHORTCUT", "", "", s[0], s[1], s[2], s[3], null, null, i));

  // 리뷰 약간
  const insR = db.prepare("INSERT INTO shop_reviews (product_id, user_id, score, content, created_at) VALUES (?, ?, ?, ?, datetime('now','localtime', ?))");
  const reviewTexts = ["배송 빠르고 포장 꼼꼼해요.", "가격 대비 만족합니다. 재구매 의사 있어요.", "생각보다 사이즈가 커요. 참고하세요.", "선물용으로 샀는데 반응 좋았어요.", "색상이 화면과 조금 달라요.", "품질 좋아요. 추천합니다."];
  for (let i = 0; i < 120; i++) {
    insR.run(productIds[(i * 13) % productIds.length], 1 + (i % 6), between(3, 5), reviewTexts[i % reviewTexts.length], `-${between(0, 30)} days`);
  }
}
