# www.naver.com · shopping.naver.com REA 분석 보고서

- 분석일: 2026-11-02
- 도구: REA (rea-agents 6.8.0) CLI — `inspect-web-page`, `capture-web-screenshot`, `capture-browser-scenario`(launch/connect 모드), `analyze-javascript-application`
- 브라우저: Chromium 156 (헤드리스, CDP 127.0.0.1:9222), Playwright 소유 임시 프로필
- 범위: PC 웹 비로그인 상태의 메인 홈과 네이버플러스 스토어 홈. 로그인 이후 화면, 상품 상세, 결제 흐름은 관측하지 않음.
- 증거 파일: `docs/naver-rea-analysis/` (스크린샷, 접근성 트리 아웃라인, 블록 JSON, API 샘플, 시나리오 정의)

관측(Observed)은 REA가 실제 브라우저에서 수집한 사실, 추론(Inferred)은 그 사실에서 유도한 해석, 미확인(Unknown)은 이번 범위에서 확인하지 못한 것입니다.

---

## 1. 메인 홈 (https://www.naver.com/)

### 1.1 화면 레이아웃과 UI/UX (관측)

접근성 트리(1,631 노드)와 DOM(2,662 노드) 기준 랜드마크 구조:

| 영역 | 랜드마크/ID | 구성 요소 |
|---|---|---|
| 스킵 링크 | `#u_skip` | 상단영역/서비스 메뉴/새소식/쇼핑/관심사/MY/위젯/보기설정 바로가기 8개 |
| 웨일 배너 | `#whale-banner`, `#whale-banner-bottom` (complementary) | 다운로드 링크, "7일 내 다시보지 않기", 닫기 |
| 헤더 | `#header` (banner) → `#topSearchWrap` | 로고(`#special-logo` 시즌 로고 슬롯), 타임보드 광고(`#timeboard-ex`, 830x130), 검색영역(`#search_area` → `#search` → `#sform`, `#search-box`, `#autoFrame` 자동완성 레이어), `#search-right` 우측 광고, `#shortcutArea` 주요 서비스 11개 + 펼침, 우측 아이콘 그룹(`#topPayArea` 페이, `#topTalkArea`, `#topNotiArea` 알림, `#topShoppingArea` 장바구니) |
| 본문 | `#container` → `#ad_premium_area`, `#root` (main) | 2컬럼. 좌: 뉴스스탠드 region, 쇼핑 region(iframe `shoppingbox`), 추천 관심사 region. 우: 로그인 정보 region, 광고 iframe 다수, `right-shopping` iframe, 날씨 region, 증시 region, 위젯 region(캘린더 table, 바이브 오디오, 영어사전 한 줄, 메모, 모바일 메인 QR) |
| 푸터 | `#footer` (contentinfo) | 광고 iframe 3개, 공지사항, Partners, Developers, 정책/약관 |

주요 서비스 바로가기 순서: 메일 · 카페 · 블로그 · 쇼핑 · 뉴스 · 증권 · 부동산 · 지도 · 웹툰 · 치지직 · (펼침) · 광고 슬롯.

UX 패턴:

- 검색창은 `combobox`("검색어를 입력해 주세요.") + "AI 검색" 버튼 + "입력도구" 버튼. 시즌(생일/여름/가을)에 따라 로고와 검색창 색을 바꾸는 인라인 스크립트가 있음(EAGER-DATA.GV.svt 날짜를 정규식으로 판별).
- 뉴스스탠드는 탭(뉴스스탠드/언론사편집/엔터/스포츠/게임/경제) + 리스트형/썸네일형 라디오 + 이전/다음 페이지 버튼. 언론사 로고는 라이트/다크 두 벌(`logoLight`, `logoDark`).
- 추천 관심사는 탭(추천/카테크/웹툰/패션뷰티/리빙푸드/책방/지식/건강) + "구독홈" 링크 + "펼쳐보기".
- 우측 상단 로그인 박스는 비로그인 시 "NAVER 로그인" CTA와 아이디/비밀번호 찾기, 회원가입.
- 다크 모드와 글꼴 크기는 서버 쿠키로 저장(`/nvhaproxy/v1/cookie/theme`, `/nvhaproxy/v1/cookie/font`) — main.js 문자열에서 관측, 호출은 미실행.

### 1.2 렌더링 방식 (관측 + 추론)

- 문서 HTML(225KB)의 `#root`는 **비어 있음**. 본문은 전부 클라이언트에서 React로 렌더링(main.js에 `react.transitional.element`, `react.lazy`, `react.suspense` 심볼 존재). 헤더/검색영역만 서버 HTML에 포함.
- 초기 데이터는 인라인 스크립트 `window["EAGER-DATA"][<블록코드>]`로 187KB JSON이 동봉됨(SSR 대신 "데이터 동봉 + CSR" 방식). 키 목록:
  `PC-MEDIA-WRAPPER`(151KB, 뉴스스탠드), `PC-NEWSSTAND-YONHAP`, `PC-PREMIUM-AD`, `PC-MYSERVICE-META`, `CAS-MINICONTENT-PC-TAB-META`, `PC-FEED-WRAPPER`(32KB, 관심사 피드), `CAS-MINICONTENT-PC-WHALE-BANNER(-BOTTOM)`, `CAS-MINICONTENT-PC-SPECIAL-LOGO`, `CAS-MINICONTENT-PC-SEARCH-RIGHT`, `CAS-MINICONTENT-PC-MID-BANNER`, `CAS-MINICONTENT-PC-MEDIA-TAB-EVENT`, `PC-HEADLINE-AD`, `GV`(서버 시각 svt 등).
- 타임보드 광고 응답은 `<script type="text/plain" id="ad-timeboard-response">`에 Naver SSP Waterfall JSON(18KB)으로 동봉되어 광고 SDK가 네트워크 없이 첫 광고를 그림.
- 화면 밖/후순위 블록은 로드 후 `GET /nvhaproxy/v2/pc/lazy`(XHR, text/html 헤더지만 본문은 JSON 144KB) 한 번으로 받음. 14개 블록: 공지/사전 한 줄/캘린더(공휴일·절기 104건)/사용자설정/이슈배너/바이브오디오/장바구니수/전체서비스추천/메모/ALL-SERVICES-META/날씨/증시 등.

### 1.3 블록(콘텐츠 조립) 체계 (관측)

모든 데이터는 동일한 블록 스키마를 따름:

```
{ "@type": "...-BLOCK", "@code": "PC-...", "@template": "...", "@flowId": "...",
  "@flowExecutionId": uuid, "@provider": "lambda", "@lastModifiedAt": ...,
  "blocks": [하위 블록], "materials": [ {"@type": "MATERIAL-..."} ], "items": [...],
  "excludeInPaging", "positionForPaging", "realtime" }
```

- `@code`가 블록 식별자, `@template`이 렌더 템플릿(예: `SIX-COLUMNS-POSTER-TWO-ROW`, `SIX-COLUMNS-POSTER-BOOK`, `FOUR-COLUMNS`, `PC-DICTIONARY`), `materials`가 카드 단위 콘텐츠, `@flowId`/`@provider: lambda`는 서버 조립 파이프라인 메타.
- 트리 예: `PC-MEDIA-WRAPPER` → `PC-MEDIA-NEWSSTAND` → `PC-NEWSSTAND-BLOCK`(majorPidList/minorPidList/catePidList/subsPidList 보유) → `PC-NEWSSTAND-PRESS-BLOCK` × 언론사(pid, name, logoLight/Dark, showThumbnailView/showListView).
- `PC-FEED-WRAPPER` → `PC-FEED-CULTURE` → `PC-FEED-CULTURE-NEW-BOOK`(12 materials) 등. main.js에 등장하는 피드 코드: `PC-FEED-RECOMMEND/CARGAME/WEBTOON/BEAUTY/LIVINGHOME/CULTURE/LECTURE/HEALTH`, `PC-MEDIA-GAME-CHZZK-LIVE`, `PC-SHORTFORM`, `PC-WEATHER`, `PC-STOCK`, `PC-MEMO`, `PC-CALENDAR`, `PC-CART-INFO`, `RANK-BLOCK`.
- 탭 전환은 새 블록을 요청: 뉴스스탠드 "언론사편집" 클릭 → `GET /nvhaproxy/v2/pc/lazy?blockCodeList=PC-MEDIA-WRAPPER&target=PC-MEDIA-NEWS…`, 관심사 "카테크" 클릭 → `…?blockCodeList=PC-FEED-WRAPPER&target=PC-FEED-CARGAME` (시나리오 ev_c54971d5…, ev_e72f4fd1…). 즉 **`blockCodeList`(래퍼) + `target`(하위 블록 코드)** 가 탭 API 규약.
- `/nvhaproxy/v2/pc/lazy/PC-VIBE-AUDIO?curationNo=` 처럼 블록별 경로 변형도 main.js에 존재(관측은 문자열만).

### 1.4 검색 동작 (관측)

| 단계 | 요청 |
|---|---|
| 입력 중 | `GET https://ac.search.naver.com/nx/ac?q=아이폰 17&con=0&frm=nv&ans=2&r_format=json&r_enc=UTF-8&t_koreng=1&run=2&rev=4&st=100&ackey=…&_callback=_jsonp_0` — **JSONP(script) 자동완성** |
| Enter | 문서 이동 `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=아이폰+17&ackey=…` |
| 결과 페이지 로드 후 | `s.search.naver.com/p/qra/1/search.naver`(연관 검색어, abt 실험 파라미터 동봉), `ns-portal.shopping.naver.com/api/v1/shopping-product-benefits`(쇼핑 상품 가격 혜택 POST), `static.nid.naver.com/getLoginStatus?callback=showGNB`(로그인 상태 JSONP), `l.search.naver.com/n/scrolllog/pc/v2`(스크롤 로그) |

최근 검색어 관련 엔드포인트는 search.js 문자열에서 관측: `s.search.naver.com/n/rkeyword/search.naver?ssc=svc.recentkeyword.main`, `s.search.naver.com/n/mykeyword/search`, 자동완성 on/off 쿠키 `/v1/cookie/search/atcmp/suggest/use`.

### 1.5 네트워크 구성 (관측, 시나리오 ev_4c80d611…, 227 요청)

| 호스트 | 역할 | 건수 |
|---|---|---|
| `s.pstatic.net`, `ssl.pstatic.net`, `search.pstatic.net`, `shopping-phinf.pstatic.net` | 정적 이미지/스크립트/CSS CDN | 59+12+10+8 이미지 등 |
| `pm.pstatic.net` | 메인 전용 번들 `main.b74cc1ba.js`(670KB), `search.13cb5749.js`(266KB), `nlog2.*.js`, `searchBarNlog`, `js.cookie` | 5 script |
| `ssl.pstatic.net/tveta/libs/*` | 광고 SDK: `ndp-loader/ndp-core`, `gfp-core`, `gfp-display-sdk 3.12.0`, `gfp-display-safeframe`, `gfp-bridge`, `glad-admute`, `pc.veta.core.min.js` | 29 script |
| `nam.veta.naver.com/gfp/v1?u=<슬롯>` | 광고 입찰/소재 JSON (슬롯: `p_main_linebanner_bottom`, `p_main_rightside_understock`, `p_main_rightbottom_widget`, `p_main_pick`, `p_main_rollingboard_v1`, `p_main_rightbottom`) | 6 fetch |
| `siape.veta.naver.com/fxshow?su=SU…`, `/openrtb/nurl`, `/openrtb/nbackimp` | 광고 iframe 문서와 노출/클릭 트래킹 | 3 doc + 4 xhr |
| `spastatic.naver.com/v1/shopad/static/shopad-spblock-node/…/_next/static/chunks/*` | 쇼핑박스 iframe의 **별도 Next.js 앱**(shopad-spblock-node, shopad-recoshopping-node) | 21 script |
| `shopsquare.naver.com/`(307) → `/categorypick`, `/api/auth` | 쇼핑 블록 iframe 문서와 로그인 여부 `{"data":{"isLogin":false}}` | |
| `recoshopping.naver.com/`, `/api/v1/recoshopping?pageSize=3&areaCode=shopping_search.ad.item` | 우측 "요즘 많이 찾는 상품" 추천 광고 iframe + 데이터(adId, nvMid, clickUrl → `ader.naver.com`) | |
| `cologger.shopping.naver.com/api/v1/collect/exlogcr` | 쇼핑 광고 노출 로그 수집 | |
| `search.naver.com/remote_frame` + `cross-domain-storage-remote-3.0.0.js` | 검색 도메인과의 **크로스도메인 스토리지 브릿지 iframe** | |
| `tivan.naver.com/sc2/*`, `/g/200/*` | 광고 노출/뷰어빌리티 핑 | 15 ping + 3 xhr |
| `nlog.naver.com/n`, `/event` | 공통 행동 로그(nlog) | 5 ping |
| `ntm.pstatic.net/scripts/ntm_*.js`, `/ex/nlog.js`, `/ex/nlog-v2.js` | 태그 매니저(NTM)와 nlog 로더 | 9 script |

- 문서 응답 헤더: `server: nfront`, `cache-control: no-cache, no-store, must-revalidate`, `x-frame-options: DENY`, `strict-transport-security: max-age=63072000; includeSubdomains`, `referrer-policy: unsafe-url`.
- CDN 폴백: 인라인 스크립트가 `error` 이벤트를 캡처해 `s.pstatic.net→s.naver.net`, `pm.pstatic.net→pm.naver.net`, `ssl.pstatic.net→sstatic.naver.net` 으로 호스트를 바꾸고 경로에 `.cdnfallback.` 을 삽입해 재요청(1% 샘플링으로 오류 로그).
- 스토리지(메인 origin): localStorage `glad_loader_policy_info`, `gfp_uuid_iv`(광고 SDK), sessionStorage `__tmp_____persist___`, `state___persist___`(상태 영속화 라이브러리로 추정). 쿠키 값은 REA가 보관하지 않음.
- 클릭 로그 코드 체계(main.js 문자열): `search_bar.nlogo`, `service_shortcut.service`, `login_box.login.tab`, `widget_board.calender`, `footer.view_setting.font_size`, `fresh_block.press_edit.article_title`, `nsb_nch.next` 등 `영역.하위영역.요소` 점 표기.

### 1.6 메인 스크립트 정적 분석 (REA `analyze-javascript-application`, 관측)

`main.b74cc1ba.js`를 제외한 7개 스크립트(총 476KB)를 선택 분석한 결과(ev_f3974f72…, 부모 ev_67c7cb75…). 파싱 7/7 완료, AST 노드 70,307개, 의미 그래프 노드 37,141개(함수 1,498, 호출지 4,577), 모듈 그래프 노드 345·간선 391(`imports` 343, `exposes` 27, `persists_to` 4, `calls` 1).

| 파일 | REA가 확인한 사실 |
|---|---|
| `nlog2.8c28c280.js` (nlog 로거) | 네트워크 엔드포인트 리터럴 `https://nelo2-col.navercorp.com/_store` 호출(`calls` 간선) — 네이버 내부 오류/로그 수집기(NELO)로 전송 |
| `gfp-core.js` (광고 SDK) | `localStorage.getItem/setItem/removeItem` 영속화(`persists_to` 4건, 런타임에서 관측된 키 `glad_loader_policy_info`, `gfp_uuid_iv`와 일치), `JSON.parse` 경계 1건, Promise 생성/체인 6건 |
| `pc.veta.core.min.js` (광고 뷰어빌리티) | `scroll resize` 이벤트 on/off 리스너 3쌍, `removeEvent` 이벤트, `setInterval` 10ms 1건과 `setTimeout` 0/500ms 등 타이머 9건, `parseFloat` 20건·`parseInt` 5건 좌표 계산 경계 |
| `search.13cb5749.js` (검색창) | `click` 리스너 3건, `setTimeout` 100ms 1건(자동완성 디바운스로 추정) |
| `js.cookie.7466b77d.js` | 라우트 후보 `/`(쿠키 path 기본값) |
| `ndp-loader.js` | `parseFloat` 경계 2건 |

라우트 인벤토리는 0건: 메인 번들을 제외한 스크립트에는 SPA 라우트 정의가 없음. 의미 노드 보존 한도(파일당 20,000)에 도달해 `search.13cb5749.js`와 `nlog2` 일부 관계는 미확정(unknown 16,878건). 번들 부트스트랩 코드는 실행하지 않았으므로 모든 관계는 정적 후보임.

---

## 2. 네이버플러스 스토어 홈 (https://shopping.naver.com/ns/home)

### 2.1 봇 방어 (관측)

- curl과 Playwright 신규 프로필의 첫 접근은 **HTTP 405 + 캡차 챌린지**(`ncpt.naver.com/v1/wcpt/m/challenge/wtm_captcha_v2.js`, `wtm.pstatic.net/*.wasm`, 폰트 프로브 `ncap-probe-*.woff2`, `/v1/wcpt/m/challenge/session`, `/v2/tokens`, `/receipt/check`, `/receipt/question`)로 전환됨(ev_6e644acc…). 통과 후 쿠키 `X-Wtm-Cpt-Tk`(shopping.naver.com, Lax, Secure)가 발급됨.
- 세션이 유지되는 기존 탭(connect 모드)에서는 정상 페이지가 로드됨(ev_050f0c92…, 305 요청). 검색 결과 페이지 `search.shopping.naver.com/ns/search?query=노트북` 도 신규 문서 요청에서 3KB 챌린지 HTML을 반환(ev_63b01f72…).

### 2.2 화면 레이아웃과 UI/UX (관측, DOM 3,614 노드 · 접근성 3,302 노드)

1. 최상단 바: NAVER 로고, 네이버페이 링크, 우측 로그인/서비스 더보기.
2. 헤더: "네이버플러스 스토어" 로고(dotLottie 애니메이션 `shopv.pstatic.net/web/lottie/2026/1012011247.lottie`), 검색 form(`textbox` "검색어 입력", "검색레이어 펼치기", "검색"), 우측 카테고리 버튼 · 마이쇼핑 · 장바구니.
3. 버티컬 탭 내비게이션: 홈(선택) · 오늘끝딜 · 컬리N마트 · 베스트 · 슈퍼적립 · 쇼핑 라이브 · 지금배달 · 선물샵 · 패션타운 · N배송 · 푸드윈도 · 하이엔드 · 노크잇(NEW) · 기획전.
4. 메인 배너 캐러셀: 이전/다음/자동재생 정지, 슬라이드마다 이미지 + 대표상품 2개 리스트 + 링크(총 30여 슬라이드, 브랜드데이/넾다세일/멤버십 적립).
5. 숏컷 아이콘 14개(넾다세일, 넾다가구, 넾다모바일, 오늘끝딜, 컬리N마트, 넾다취미템, 지금배달, 넾다멤버십, 넾다댕냥템, 쇼핑라이브, N배송, N여행핫딜, 슈퍼적립, 하이엔드). 일부에 넛지 말풍선 문구.
6. "오늘의 행사 놓치지 마세요!" 12 카드(라벨: 1+1/슈퍼적립/오늘끝딜/쇼핑LIVE/NEW/신상위크/브랜드DAY/N배송).
7. "오늘만 이 가격 한정수량 특가"(오늘끝딜): 카드마다 `time` 요소 남은 시간, 찜하기 버튼, 멤버십 전용 배지, 원가/할인율/판매가, "배송비 별도" 버튼.
8. AI 스토어 큐레이션: "Ai 생성 툴팁 보기", "다른 추천 보기", 스토어 펼치기 버튼 4개 + 상품 그리드(여기서는 "차량 수납·정리" 테마).
9. 푸터: 약관/개인정보/입점안내/파트너센터/고객센터 전화(3종), 맨위로 버튼.

### 2.3 프런트엔드 구조 (관측)

- **Next.js(pages router)**: 정적 자산은 `shopv.pstatic.net/web/r/<빌드시각 20261028105322>/_next/static/…`, 빌드 ID `on9RdNsUiEBxuKaZ6u7mI`. 페이지 청크 `pages/ns/home/[demo]/[client]/[deviceType]`, `pages/_app`. 데이터 라우트 `HEAD /_next/data/<buildId>/ns/home.json?demo=NOT_LOGIN&client=BROWSER&deviceType=PC`.
- `_buildManifest.js`에서 복원한 라우트 31개(파일 `shopping-nextjs-routes.txt`):
  `/ns/home/[demo]/[client]/[deviceType]`, `/ns/home/preview`, `/ns/search`, `/ns/category/[client]`, `/ns/app/promotion/[id]/[client]/[deviceType]`, `/promotion/[client]/[deviceType]`, `/promotion/ssr/...`, `/gift/{home,category,search,npaygiftcard}`, `/logistics/{home/[client]/[deviceType],category,search,home/preview}`, `/super-point/{home/[membershipSubscription]/[client]/[deviceType],category}`, `/fresh/{directfarm,healthy,homemeal,localfood,traditionalalcohol}/search`, `/redirect/login`, `/redirect/pay-agreed`, `/service-closed`, `/404`.
  → 하나의 Next.js 앱이 **ns(새 스토어 홈) · gift · logistics(N배송) · super-point · fresh** 버티컬을 공유하고, URL 세그먼트 `[demo]`(비로그인 `NOT_LOGIN`, 세그먼트 예 `WOMEN1`), `[client]`(BROWSER), `[deviceType]`(PC)로 개인화 변형을 분기(추론).
- 공통 GNB는 레거시 템플릿 `ssl.pstatic.net/static.gn/templates/gnb_utf8.nhn` + `static.nid.naver.com/getLoginStatus?callback=showGNBReload` JSONP로 로그인 상태 반영.
- 모바일 도메인과의 스토리지 공유: `m.shopping.naver.com/remote_frame.html` + `remote_frame_storage.js`(`nhn.mobile.fs.RemoteFrameStorage`, 화이트 도메인 목록) 및 `shopv.pstatic.net/web/framestorage.2.2.6.js`.
- 외부: `pagead2.googlesyndication.com/adsbygoogle.js`, `cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.39.0`.
- 스토리지 키(localStorage): `CATEGORY_LAYER_INTEREST_NEW_SHOPPING_GUEST`, `CATEGORY_LAYER_CATEGORY_ALL_NEW_SHOPPING_GUEST`, `nsh_nudge_history`, `glad_loader_policy_info`, `gfp_uuid_iv`; sessionStorage `nshome:last_login_state`.

### 2.4 데이터 레이어: API 인벤토리 (관측, 응답 본문 포함)

| 엔드포인트 | 메서드 | 역할 / 응답 형태 |
|---|---|---|
| `shopping.naver.com/api/modules/gnb/category/list?newShopping=true` | GET | 카테고리 트리 44KB: `categories[27]{id,name,type,children[],exposedVerticals[]}` + `banners[17]{slotId,exposureStartAt/EndAt,narrowContent,category}` |
| `shopping.naver.com/api/modules/gnb/category/interest` | GET | 관심 카테고리(비로그인 `[]`) |
| `shopping.naver.com/api/modules/gnb/banner/shopping-banners?path=` | GET | GNB 배너(`[]`) |
| `shopping.naver.com/api/modules/gnb/auto-complete?keyword=&personalizeYn=n&vertical=` | GET | 검색 자동완성 `{result:{keywordList[{keywordName,keywordTag}]}}` |
| `shopping.naver.com/api/delta/experiments` | GET | A/B 실험 배정 `{data[{eid,version_id,vid,is_control,id_type,is_treated,treated_type,extra_param}]}` — 관측된 eid: `NS-SHP-RANK-26`, `NS-SHP-UX-26-5TH`, `S-PDP-UX-26-BUY`, `NS-PND-RANK-26` |
| `api-shopping-kitcat.io.naver.com/abt.js?env=prod` | script | 같은 실험 정보를 `<meta name="ntm-abt">`로 주입(태그 매니저 연동) |
| `shopping.naver.com/responsive/api/shopv/graphql?operationName=…&extensions={"persistedQuery":{"version":1,"sha256Hash":…}}` | GET | **GraphQL persisted query**: `FetchPayRestrictCategoryMap`(31 카테고리 포인트적립 여부), `FetchNsHomeTopBanner` |
| `vertical-api.shopping.naver.com/v3/web/v2/service-shortcuts` | GET | 숏컷 3그룹 `primaryVerticalShortcuts[6]`, `marketingShortcuts[3]`, `verticalShortcuts[10]` (`serviceCode`: PROMOTION/KURLYNMART/MARKET/SELECTIVE/LOGISTICS/TRAVEL/SUPER_POINT/HIGHEND/SUPER_SALE/FASHION_GROUP/KNOCKIT/SMESTORE/GIFT, `nudgeMessage`, `promotionNlog`) |
| `…/v3/web/v1/home/layouts/today-events` | GET | 오늘의 행사 12건 `{titleInfo{title,highlights},demoType:"WOMEN1",events[{serviceEditorPanelId/LayoutId/ContentId,imageUrl,titleText,headerText,labelText,landingUrl,nlog{…}}]}` |
| `…/v3/web/v2/home/layouts/low-involvement-promotions` | GET | 저관여 프로모션 레이아웃 |
| `…/v3/web/v2/home/layouts/store-curation?isOptOut=true` | GET | AI 스토어 큐레이션 `{displayType:"RANKING",dataType:"aitems",themeId,categoryName,tagName,pageId,titleInfos,stores[8]{channelNo,channelUid,channelName,channelSiteFullUrl,representImageUrl,channelProductIds[]}}` |
| `…/v3/web/v1/home/layouts/membership-onboarding` | GET | 204 (비로그인) |
| `…/v3/web/v1/home/products?channelProductIds=…(×12)` | GET | 상품 카드 모델 `[{channelProductId, channelMeta{accountNo,channelNo,channelUid,channelName,channelSiteFullUrl,channelServiceType}, productMeta{productNo,name,imageUrl,productUrl,salePrice,dispSalePrice,categoryWholeIds[4],epInfo{…}}, deliveryMeta{baseFee,isFreeDelivery,isTodayDelivery,isArrivalGuarantee,…}, reviewMeta{totalReviewCount,averageReviewScore}, benefitMeta{dispDiscountedSalePrice,dispDiscountedRatio}, productAdditional{promotionTags,isRental,isRegularSubscription,isUsed,isPreOrder,…}}]` |
| `…/v3/web/v1/products/thumbnail-tags` | POST `{pickTypes[LOUNGE,PROMOTION,VOUCHER,ARRIVAL_GUARANTEE,MEMBERSHIP_EXCLUSIVE],exposureScreenPathType:"HOME_TAB",products[{channelNo,channelProductId}]}` | 상품별 썸네일 배지 `{<channelProductId>:{type,detailType,title,color,imageUrl,promotionTagAdditional{key,campaignId}}}` |
| `…/v3/web/v1/products/display-infos` | POST (+`PERSONALIZATION`,`SUPER_DANGOL`, `price`) | 상품별 태그/내 할인가/포인트 `{<id>:{tags[],myDiscountPrice,points}}` |
| `…/v3/web/v1/branch-products/options` | POST `[{channelProductId,subVertical,branchId}]` | 지점 상품 옵션/가격 `[{optionId,dispSalePrice,dispDiscountedSalePrice,dispDiscountedRatio,soldOut,deliveryCost,bagCost}]` |
| `…/v3/web/v1/branches/sub-vertical-mapping?latitude&longitude` | GET ×2 (기본 좌표 37.498157/127.02766 와 0/0) | 지역 기반 지점 매핑 `[29x {subVertical,branchId,isRepresent}]` (지금배달/컬리N마트 등) |
| `…/v3/web/v3/rmid/representative` | GET | 배송권역 `{zipCode, rmidItems[193]{rmid,orderDeadline,arrivalDatetime,tagType}}` — 도착보장 문구 계산용(추론) |
| `…/v3/web/v2/advertisement?queryParams=u=m_new_shoppinghome_top_1…` | GET ×2 | 홈 상단 광고(GFP 응답 포맷 `payload.ads[], eventTracking{…}`) |
| `…/v2/fe/maintenance/window/under-maintenance` | GET | 점검 플래그 |
| `shopv.pstatic.net/web/conex/static-config/latest/real/config/corepack.json` | GET | 버티컬별 디자인 토큰(색상: TRADITIONAL_MARKET/MARKET/NECESSITY/DEPARTMENT …) |
| `shopv.pstatic.net/web/vertical-module/static-config/latest/PRODUCTION/config/footer.json` | GET | 푸터 전화번호 설정 |
| `nlog.naver.com/n`, `/event`, `nlog.commerce.naver.com/n`, `/event` | POST | 행동 로그(일반 + 커머스 전용 수집기) |

호스트 역할 정리: `shopping.naver.com/api/modules/*`(GNB 공통 모듈 BFF), `shopping.naver.com/responsive/api/shopv/graphql`(GraphQL 게이트웨이), `vertical-api.shopping.naver.com/v3/web/*`(홈 레이아웃·상품·지점 BFF, 버전 세그먼트 v1/v2/v3 혼재), `shopv.pstatic.net`(정적 자산 + 정적 설정 JSON), `shop-phinf.pstatic.net`(상품 이미지 183건).

### 2.5 상품/스토어 도메인 모델 (관측에서 추론)

- 스토어 = 채널(`channelNo`, `channelUid`, `accountNo`, `channelServiceType`), 사이트 URL은 `brand.naver.com/<id>` 또는 `smartstore.naver.com/<id>`.
- 상품 = `channelProductId`(채널 내 상품) ↔ `productNo`, 카테고리 경로 `categoryWholeIds[4]`(4단계), `epInfo`로 외부 가격비교(네이버쇼핑/에누리/다나와) 등록 여부.
- 가격 표시는 `salePrice` → `dispSalePrice`(표시가) → `benefitMeta.dispDiscountedSalePrice`(할인가) → `display-infos.myDiscountPrice`(개인화) 단계로 덧씌워짐. 배지(`pickTypes`)는 별도 API로 후속 조회해 카드에 합성.
- 홈 구성은 "레이아웃" 단위 API(`home/layouts/<name>`) + 상품 ID 목록 → 상품 메타 일괄 조회 → 태그/혜택 보강의 3단계 호출 패턴.
- 카테고리는 27개 대분류(여성의류 … 여행), 각 대분류에 `exposedVerticals`(fashion_town, high_end, knockit, direct_farm, market, kurlynmart, local_food, travel_hotdeal)로 전문관 연결.
- 개인화/실험은 `demo`(인구통계 세그먼트, 비로그인 `NOT_LOGIN`이지만 today-events는 `demoType:"WOMEN1"` 반환), `delta/experiments`의 `vid` 배정으로 분기.

### 2.6 UX 동작 관측 (시나리오 ev_63b01f72…)

- "카테고리" 버튼 클릭 → 추가 네트워크 없음(초기 `gnb/category/list` 응답을 레이어에서 재사용, localStorage `CATEGORY_LAYER_*` 키 사용 추론).
- 검색창에 "노트북" 입력 → `gnb/auto-complete?keyword=노트북&personalizeYn=n` XHR, 추천어 10건(`삼성 노트북`, `노트북 거치대`, `게이밍 노트북`…).
- Enter → `search.shopping.naver.com/ns/search?query=노트북` 으로 **다른 서브도메인 문서 이동**(봇 챌린지로 결과 미관측).

---

## 3. 클론 구현 시 참고할 설계 포인트 (추론)

1. 메인: 서버 HTML에 헤더만 두고 본문은 React CSR + 인라인 초기 데이터(EAGER-DATA) + lazy 블록 API. 블록 스키마(`@code/@template/materials`)를 그대로 쓰면 탭/페이징을 `blockCodeList`+`target` 하나의 엔드포인트로 통일할 수 있음.
2. 쇼핑: Next.js pages router + `[demo]/[client]/[deviceType]` 동적 세그먼트, 홈은 레이아웃 API 여러 개를 병렬 호출 후 상품 메타·배지·혜택을 ID 기준으로 머지.
3. 광고/로그 계층은 별도 SDK(gfp/ndp, nlog, ntm)로 분리되어 있고, 광고 슬롯은 `nam.veta.naver.com/gfp/v1?u=<slot>` 같은 슬롯 ID 규약.
4. 공통 GNB 로그인 상태는 JSONP(`getLoginStatus?callback=`)와 크로스도메인 스토리지 iframe으로 동기화.
5. 디자인 토큰은 정적 JSON(`corepack.json`)으로 배포되어 버티컬별 색상을 런타임에 적용.

---

## 4. 한계와 미확인 사항

- REA의 정적 번들 분석은 670KB `main.b74cc1ba.js`에서 기본 5분(`analysis_timeout_ms`=300000) 제한을 초과함(부분 증거 ev_c01f04ed…). 대안으로 나머지 7개 스크립트를 `--source-path`로 선택 분석해 1.6절에 반영했다. 큰 번들은 제한 2시간·힙 1536MB로 단독 재분석했으나 의미 분석 단계에서 다시 시간 초과(ev_39b0d1e3…, 부분 증거)됐다. 이 호스트(Raspberry Pi 5)에서는 REA 의미 분석이 끝나지 않으므로 메인 번들 서술은 문자열 추출과 런타임 관측에 근거하며, 더 빠른 장비에서 같은 디렉터리를 분석하면 보완할 수 있다.
- `analyze-web-bundle`은 메인 origin 스크립트(인라인 11개)만 분석해 라우트 후보 0건(ev_95e4ad35…). 타 origin 허용 목록 옵션의 CLI 형식 오류로 외부 스크립트 분석은 미수행.
- 스크린샷의 한글이 □로 보이는 것은 분석 호스트에 CJK 폰트가 없기 때문이며 사이트 문제가 아님.
- 로그인 사용자 전용 블록(MY 영역, 멤버십 온보딩, 개인화 가격), 상품 상세(PDP), 장바구니/결제, 모바일 레이아웃, 서비스워커 동작은 미관측.
- 쇼핑 검색 결과 페이지와 신규 세션의 쇼핑 홈은 봇 챌린지로 차단되어 내용 미관측. 이번 분석은 챌린지를 우회하지 않았고, 이미 통과된 세션 탭만 재사용함.
- 네트워크 관측은 각 시나리오의 시간창(5~10초) 안에서 발생한 요청에 한정됨. 스크롤 이후 지연 로드는 포함되지 않음.

## 5. 증거 ID

| 관측 | Evidence ID |
|---|---|
| 브라우저 타깃 목록 | ev_f5a7003fc9e0888031cf5e97e7cb4fcc0521aa6018c28b41f08150b1eb0725f4 |
| 메인 페이지 수동 관측(DOM/접근성/스토리지) | ev_d0f8ce08020a2e693b9b0a7bc0e125d69134ce6e1cbf864e43f7369b01ca0a8c |
| 메인 스크린샷 | ev_ee64cc953932e92904aef527466a3815a0af3728d4017d05a2970a970e5d7274 |
| 메인 로드 네트워크 227건(헤더 포함) | ev_4c80d611eefd0cc2931d595ebccf84a6c683dce2adb8c1a3cba523a4f88ea57e |
| 메인 뉴스스탠드 탭 전환 | ev_e72f4fd12828f9344c8425373643d2184b9f1b658a04f2e051d15527cfcd6020 |
| 메인 바로가기 펼침·관심사 탭·자동완성·검색 제출 | ev_c54971d582c9bd3442a7c4408e548f414620faf39283b1922b9ad8c2150540f0 |
| 쇼핑 홈 수동 관측 | ev_6434d35a5b87a0fc715fb555c2c6209ced19309d028c9f3e30370bd681368337 |
| 쇼핑 스크린샷 | ev_5a64a71b912cda64e524289d14310d63d35be44e2436361ca7d09a36f0b30cfe |
| 쇼핑 홈 신규 세션(봇 챌린지 관측) | ev_6e644acca734debfcb4ef0f3c01eb5c1a1219fc0f5e814e2a401b5368f20b5cd |
| 쇼핑 홈 로드 네트워크 305건(본문 포함) | ev_050f0c92a2421b9226a75eb912fea377de04bb477393fc4d666a81a1a220f3fd |
| 쇼핑 카테고리 레이어·자동완성·검색 제출 | ev_63b01f72891f857b3074d4974530ea628289a57d2a157bae0173098cbbc9708c |
| 메인 origin 스크립트 번들 분석 | ev_95e4ad355673c12b169d919216c42069cea3de08e0bae87c8d06fe7140158e10 |
| 메인 스크립트 정적 분석(부분, 타임아웃) | ev_c01f04ed354761aba8e3821deb028ba05b37300588aead525cb4986b4cd58d77 |
| 메인 소형 스크립트 7개 정적 분석(요약 뷰 / 부모) | ev_f3974f72a817fba2a5fe3961f7c0dfc3eea52342dd250d30555e54ca960bc748 / ev_67c7cb751906185be2e39fc7fa42c3b11f70e5e614f69733945fb3683587caa7 |
