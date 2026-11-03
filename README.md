# DAYVER

네이버 PC 웹(www.naver.com, shopping.naver.com 등)을 REA(Reverse Engineer Anything)로 관측·분석한 결과를
같은 구조와 UI로 재해석해 만든 학습용 포털입니다. 브랜드·언론사·스토어·인물은 모두 허구입니다.

- 분석 보고서: `docs/naver-rea-analysis.md` (증거 파일 `docs/naver-rea-analysis/`)
- 구현 규약: `docs/dayver-conventions.md`

## 서비스

| 경로 | 서비스 | 내용 |
|---|---|---|
| `/` | 메인 | 검색(자동완성), 바로가기, 뉴스스탠드(탭·페이징), 쇼핑 블록, 추천 관심사 피드(탭), 로그인 박스, 날씨·증시·캘린더·메모 위젯. 초기 데이터는 `window["EAGER-DATA"]`, 지연 블록은 `/api/lazy` |
| `/search?query=` | 통합검색 | 뉴스·블로그·카페·쇼핑 탭, 연관 검색어, 자동완성 `/api/search/ac` |
| `/login` `/signup` `/me` | 계정 | 회원가입, 로그인(세션 쿠키), MY 페이지, 알림 센터(`/me/notifications`), 설정(`/me/settings`: 프로필·비밀번호·보기 설정) |
| 푸터 보기 설정 | 테마/글꼴 | 다크 모드·글꼴 크기를 쿠키 `dv_theme`/`dv_font`에 저장(`/api/cookie/theme`, `/api/cookie/font`), 로그인 시 계정에도 저장 |
| `/news` `/newsstand` | 뉴스 | 언론사 편집판, 섹션, 기사, 구독, 랭킹, 뉴스스탠드 뷰어 |
| `/shopping` | 쇼핑 | 스토어 홈, 카테고리, 상품, 검색, 장바구니, 주문, 찜, 리뷰 |
| `/cafe` | 카페 | 카페 홈, 카페 만들기, 게시판, 글쓰기, 댓글, 가입 신청, 운영(관리) |
| `/blog` | 블로그 | 블로그 홈, 글쓰기, 내 블로그, 공감, 댓글, 이웃 |
| `/mail` | 메일 | 받은/보낸/임시/별표/스팸/휴지통, 메일 쓰기(`아이디@dayver.com`) |
| `/weather` | 날씨 | 지역 선택(쿠키 `dv_region`), 현재·시간별·주간 예보, 생활지수, 예보 비교. 메인 날씨 위젯이 같은 데이터를 사용 |
| `/stock` | 증권 | 데이스피/데이스닥 지수, 종목 상세(차트·토론), 관심종목, 검색. 메인 증시 위젯이 같은 데이터를 사용 |
| `/map` | 지도 | 장소 검색·카테고리, SVG 지도 핀, 장소 상세·리뷰, 길찾기 |

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

- Node.js 22.5+ (`node:sqlite` 사용). DB 파일은 `data/dayver.db`에 자동 생성되고 첫 실행 때 시드가 들어갑니다.
- 데모 계정: `haru / dayver1234` (dayver, minsu, jiyeon, store_master, newsdesk 동일 비밀번호)
- 개발 중 시드 초기화: `curl -X POST http://localhost:3000/api/dev/reset`
- 상태 확인: `GET /api/health`

## 다른 기기에서 접속 (LAN · Tailscale)

개발 서버는 모든 인터페이스에 바인딩되므로(`next dev`를 `-H` 옵션 없이 실행), 같은 네트워크나 테일넷의
기기에서 바로 접속됩니다. Tailscale이라면 아래 네 가지 주소를 모두 쓸 수 있습니다.

| 주소 | 비고 |
|---|---|
| `http://<노드>.<테일넷>.ts.net:3000` | MagicDNS 전체 이름 (권장) |
| `http://<노드>:3000` | MagicDNS 짧은 이름 |
| `http://100.x.y.z:3000` | Tailscale IPv4 |
| `http://[fd7a:115c:a1e0::...]:3000` | Tailscale IPv6 |

접속할 호스트명은 `.env.local`의 `DAYVER_DEV_ORIGINS`에 쉼표로 구분해 등록해야 합니다
(`.env.example` 참고). 등록하지 않으면 페이지는 열리지만 HMR과 dev 전용 자산(글꼴 등)이 403으로
차단됩니다. `next.config.ts`가 이 값을 읽어 `allowedDevOrigins`에 넣습니다.

```bash
cp .env.example .env.local   # 그리고 DAYVER_DEV_ORIGINS를 자기 주소로 채운다
```

> `next dev -H 0.0.0.0`으로 띄우면 IPv4만 바인딩돼 Tailscale IPv6 주소가 닿지 않습니다. 옵션 없이 띄우세요.

HTTPS로 열고 싶다면 Tailscale이 발급하는 인증서를 쓰는 `tailscale serve`를 추가합니다. 443이 다른
서비스에 이미 쓰이고 있다면 별도 포트를 지정하세요.

```bash
sudo tailscale serve --bg --https=8443 http://127.0.0.1:3000   # https://<노드>.<테일넷>.ts.net:8443
sudo tailscale serve status                                     # 확인
sudo tailscale serve --https=8443 off                           # 해제
```

`tailscale funnel`은 공개 인터넷에 노출되므로 쓰지 않습니다. 접속 범위는 테일넷으로 제한하세요.

## 구조

```
src/app            라우트 (App Router)
src/components     공통(common) · 메인(main) · 서비스별 컴포넌트
src/lib/db.ts      node:sqlite 래퍼 (all/get/run/transaction)
src/lib/schema.ts  전체 스키마
src/lib/seed/      서비스별 시드
src/lib/auth.ts    세션/비밀번호
src/lib/actions/   서버 액션
```
