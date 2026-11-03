# Dayver 검증 기록 (REA)

Dayver 자체도 REA `capture-browser-scenario`(launch 모드, Chromium 헤드리스)로 네이버와 같은 방식으로 관측·검증했다.
시나리오 정의와 스크린샷은 `docs/naver-rea-analysis/dayver-*.{json,png}`.

| 시나리오 | 결과 | Evidence ID |
|---|---|---|
| 메인 로드 → `/api/lazy` 지연 블록 호출 → 관심사 탭 "건강" 클릭 시 `/api/lazy?blockCodeList=PC-FEED-WRAPPER&target=PC-FEED-건강` 호출 | 통과 | scn-dayver-main.json (localhost 접속) |
| 로그인 폼 입력(haru) → Enter → POST 후 `/`로 리다이렉트 | 통과 | scn-dayver-login.json |
| 로그인 → 블로그 글 발행(`/blog/haru/85`) → 메일 전송(`/mail/sent?sent=1`, 수신자 알림 1건) → 상품 장바구니 담기(`shop_cart_items` 1) | 통과 | ev_ab281afb7cb3e16d67241ffe3855d9966ca678506135b3e241b0334ad30edbde |
| 카페 만들기(주제 선택 포함) → `/cafe/rea-lab` 생성, 운영자 멤버·기본 게시판·환영 공지 자동 생성 | 통과 | ev_3edeef9ff6456f8d6a30d24be13e70bfdadc58fef519aefc6fef6fd1e84cfe85 |
| 카페 글쓰기(`/cafe/rea-lab/post/237`) → 장바구니 주문하기(`/shopping/orders/1`, 장바구니 비워짐) → 카페 관리 페이지 | 통과 | ev_9a842453d87fbb984649c2480977703a637a2147f379328319baaa5a73933b01 |
| 로그인 → 설정에서 '다크' 클릭(`/api/cookie/theme` 호출) → 닉네임 변경 저장 → 메인(사용자 박스에 새 닉네임) | 통과 | ev_91be979fda02d165b12fa9d40573fa916cbb6ee3897ad4345b46e2325fc93bfe |
| request 스텝으로 테마=dark·글꼴=large 설정 → 메인 재로드 → 다크 화면·확대 글꼴 스크린샷(`dayver-dark-main.png`) | 통과 | ev_7a884d714f0491b949202d64ee81415607bd15949204aedc4e09d674a2c01f3c |
| 날씨·증권·지도 페이지 렌더(스크린샷 `dayver-weather.png`, `dayver-stock.png`, `dayver-map.png`), `/api/lazy`가 날씨 서비스 예보와 증권 지수를 반환 | 통과 | 수동 관측(capture-web-screenshot) |
| Tailscale MagicDNS 주소(`http://<노드>.<테일넷>.ts.net:3000`)로 메인 로드 → 비200 응답 0건, `/api/lazy` 호출, 관심사 탭 전환, 콘솔 오류 0 | 통과 | ev_bb7ad70040cf2e3a05cd027d2e709ca6b058367a4c556361cdf4edbc86ba438d |
| EAGER-DATA 스크립트를 `next/script`로 교체 후 메인 → 뉴스 → 메인(클라이언트 네비게이션) → 콘솔 경고·오류 0 | 통과 | ev_ebb6a5d469bb07df12c4e5a494a5421913140dc4e30124a460d478052a09c9ab |
| 재확인: 메인 → 뉴스 → 로고 클릭으로 메인 복귀(모두 `_rsc` 클라이언트 네비게이션). 콘솔 2건(React DevTools 안내·HMR 연결)뿐, 경고·페이지 오류·실패 요청 0. 복귀한 DOM에 `<script id="eager-data" data-nscript="afterInteractive">` 존재 | 통과 | ev_2fd0080bb414f2636f982d4e551e12e88ad37f920910def5ff79bfae63e35f5e |
| `node_modules` 유실 → `npm ci` 복구 후 같은 시나리오 재확인. 8단계 모두 완료, 콘솔은 React DevTools·HMR·Fast Refresh 4건뿐(경고·오류 0), `eager-data` 스크립트 정상 | 통과 | ev_c670c09bbb22ac292b6507f5c5a53a7c47fb178e5f1c7e88a215b19e9093011d |

관측된 제약:
- 카페 만들기에서 주제(select)는 필수이므로 선택하지 않으면 브라우저 기본 검증이 제출을 막는다(의도된 동작).
- `globals.css`를 바꾼 뒤 dev 서버가 이전 CSS 청크를 계속 내려주는 경우가 있었다. 서버를 재시작하면 반영된다.
- dev 자산(HMR·글꼴)은 `allowedDevOrigins`에 있는 호스트명에서만 허용된다. 목록은 `.env.local`의 `DAYVER_DEV_ORIGINS`에서 읽고(localhost·127.0.0.1은 기본 포함), 값을 바꾸면 서버를 재시작해야 적용된다.
- `next dev -H 0.0.0.0`으로 띄우면 IPv4만 바인딩돼 Tailscale IPv6 주소가 닿지 않는다. 옵션 없이 띄우면 듀얼스택(`*:3000`)으로 바인딩된다.
- `tailscale serve` 설정 변경은 root 권한이 필요하다(이 호스트에는 비밀번호 없는 sudo가 없어 사용자가 직접 실행해야 한다). 443은 이미 netmon(8080)이 쓰고 있다.
- 2026-11-03 13:58경 `node_modules`와 `.next`가 외부 요인으로 통째로 사라져 dev 서버가 종료 코드 1로 죽었다(로그: `.next/dev` 삭제 감지 → 자동 재시작 → `start-server.js` MODULE_NOT_FOUND). 소스·문서·`data/dayver.db`는 무사했고 `npm ci`로 락파일 그대로 복구했다. 같은 일이 생기면 `npm ci` 후 dev 서버만 다시 띄우면 된다(시드 재생성 불필요).

정적 점검:
- `npx tsc --noEmit` 통과, `npx eslint src` 오류 0, `next build` 성공(모든 페이지 동적 렌더링).
- 라우트 스윕: 공개 페이지 200, 로그인 필요 페이지는 `/login?next=`로 307.
