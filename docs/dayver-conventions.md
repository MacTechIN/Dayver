# Dayver 구현 규약 (모든 서비스 담당자 공통)

Dayver는 네이버 PC 웹을 REA로 관측한 결과(`docs/naver-rea-analysis.md`)를 같은 구조·UI로 재해석한 포털이다.
브랜드명은 **DAYVER**, 로고는 초록 "D" 마크 + 서비스명(네이버의 "N blog", "N Cafe" 형태 재해석). 네이버·NAVER 문자열, 실제 언론사/브랜드/인물 이름은 쓰지 않는다(허구 이름 사용).

## 스택
- Next.js 16.4 (App Router, `src/app`), React 19, TypeScript strict, Tailwind v4 (`src/app/globals.css`의 `@theme`).
- DB: SQLite via `node:sqlite` (`src/lib/db.ts`). 파일 `data/dayver.db`. 스키마는 `src/lib/schema.ts`(이미 전 서비스 테이블 정의됨). 시드는 `src/lib/seed/<service>.ts`.
- 인증: `src/lib/auth.ts` — `getCurrentUser()` (서버 컴포넌트/액션/라우트), `User` 타입. 로그인 페이지 `/login?next=<path>`, 회원가입 `/signup`, 로그아웃 `/logout`.
- 데모 계정: `haru / dayver1234` (dayver, minsu, jiyeon, store_master, newsdesk 동일 비밀번호). `src/lib/seed/core.ts` 참고.

## 데이터 접근
```ts
import { all, get, run, transaction } from "@/lib/db";
const rows = all<{ id: number; title: string }>("SELECT id, title FROM cafes WHERE category = ? LIMIT ?", cat, 10);
const row = get<Cafe>("SELECT * FROM cafes WHERE slug = ?", slug);
const { lastId } = run("INSERT INTO cafe_posts (...) VALUES (?, ?)", a, b);
```
- 파라미터는 위치 기반 `?`만 사용. 값은 string | number | null.
- `"server-only"`를 import하는 모듈(db, auth)은 클라이언트 컴포넌트에서 import 금지.
- 글쓰기 등 변경은 **서버 액션**(`"use server"` 파일, `src/lib/actions/<service>.ts`) 또는 `src/app/api/<service>/**/route.ts`로. 액션에서 성공 후 `redirect()` 또는 `revalidatePath()`.
- 로그인 필요 동작: 액션/페이지에서 `const user = await getCurrentUser(); if (!user) redirect("/login?next=" + encodeURIComponent(path));`.

## 시드
- `src/lib/seed/<service>.ts`의 `seedX(db)`를 구현. **자기 테이블이 비어 있을 때만** 데이터 삽입 (`isEmpty(db, "table")`). 결정적 난수는 `rng(seed)`, 색상 `PALETTE`, 시각 `minutesAgo(n)` 사용 (`./index`에서 import).
- 사용자 id는 1~6 (dayver=1, haru=2, minsu=3, jiyeon=4, store_master=5, newsdesk=6).
- 스키마 변경이 꼭 필요하면 `schema.ts`를 고치지 말고 자기 seed 파일 상단에서 `db.exec("CREATE TABLE IF NOT EXISTS ...")`/`ALTER TABLE`로 추가한다(멱등하게).
- 시드를 다시 돌리려면 dev 서버가 켜진 상태에서 `curl -X POST http://127.0.0.1:3000/api/dev/reset` (DB 파일을 지우고 다시 열어 모든 시드를 재실행).
- 이미지 파일은 쓰지 않는다. 썸네일은 `<div className="dv-thumb" style={{background: color}}>라벨</div>` 색 블록으로 표현한다(네이버 관측 스크린샷의 이미지 자리).

## 라우팅/타입
- 페이지 props 타입은 `PageProps<...>`를 쓰지 말고 명시적으로:
  `{ params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }` 후 `await`.
- 라우트 핸들러: `export async function GET(req: Request, ctx: { params: Promise<{ id: string }> })`.
- 모든 페이지는 `export const metadata` 또는 `generateMetadata`로 `"<제목> - DAYVER <서비스>"` 형태 타이틀.

- 인라인 스크립트는 React가 직접 렌더한 `<script>`로 쓰지 않는다(클라이언트 네비게이션에서 실행되지 않고 콘솔 경고가 난다). `next/script`를 쓰고 `id`를 반드시 준다.

## 공통 UI 컴포넌트 (`src/components/common`)
- `<TopBar service="카페" serviceHref="/cafe" serviceColor="#2db400" />` : 상단 공통 바(로고, 서비스명, 로그인/사용자 메뉴, 서비스 더보기). async 서버 컴포넌트. `tone="dark"`는 뉴스처럼 진한 배경.
- `<Footer />` 전체 푸터, `<Footer compact />` 간단 푸터.
- `<DayverLogo service="blog" href="/blog" size={32} />`, `<DayverMark />`.
- `<LoginBox next="/cafe" />` 우측 로그인 박스(비로그인 CTA / 로그인 요약).
- 디자인 토큰(Tailwind 클래스): `text-dv-green bg-dv-green text-dv-text text-dv-text-2 text-dv-text-3 border-dv-border bg-dv-bg-2 bg-dv-bg-3 text-dv-red text-dv-purple text-dv-blue`, 유틸 `dv-container`(1280px 중앙) `dv-card` `dv-btn-green` `dv-ellipsis` `dv-clamp-2` `dv-skip` `dv-thumb`.
- 본문 폭 1280px 고정(`dv-container`), 기본 폰트 14px Pretendard. 네이버와 같은 2~3컬럼 카드 레이아웃.

## 접근성/구조 (REA 관측과 동일하게)
- 페이지 상단에 `<a href="#content" className="dv-skip">본문 바로가기</a>` 스킵 링크.
- 랜드마크: `<header>`(banner), `<nav aria-label>`, `<main id="content">`, `<aside>`, `<footer>`(contentinfo). 탭은 `role="tablist"/"tab"`, 섹션은 `<section aria-label>` + `<h2>`.
- 클릭 로깅 규약 흉내: 주요 링크에 `data-clk="영역.하위.요소"` 속성(예: `data-clk="cafe_home.popular.title"`).

## 서비스 간 인터페이스 (메인/통합검색이 import하는 함수 — 반드시 이 이름·형태로 export)
`src/lib/<service>.ts` (server-only, `@/lib/db` 사용). 모든 함수는 동기, 빈 배열 허용.
- news: `listPress(opts?: { major?: boolean; category?: string; limit?: number }): Press[]`
  `Press = { id; name; slug; category; logo_color; is_major }`
  `getPressArticles(pressId: number, limit: number): Article[]`, `listHeadlines(limit: number): Article[]`,
  `listArticlesBySection(section: string, limit: number): Article[]`, `searchArticles(query: string, limit: number): Article[]`
  `Article = { id; press_id; press_name; section; title; summary; image_color; created_at; views }` (글 링크는 `/news/article/${id}`)
- shopping: `listTrendingProducts(limit): Product[]`, `listDeals(limit): Product[]`, `searchProducts(query, limit): Product[]`, `listShortcuts(): { name; href; color; icon? }[]`
  `Product = { id; name; sale_price; discount_rate; image_color; channel_name; channel_slug; review_count; review_score; tag_title }` (링크 `/shopping/product/${id}`)
- cafe: `listPopularPosts(limit): CafePost[]`, `searchCafes(query, limit): { id; slug; name; description; category; color; member_count }[]`, `searchCafePosts(query, limit): CafePost[]`
  `CafePost = { id; cafe_id; cafe_slug; cafe_name; title; content; author; likes; comment_count; created_at }` (링크 `/cafe/${cafe_slug}/post/${id}`)
- blog: `listRecentPosts(limit): BlogPost[]`, `searchBlogPosts(query, limit): BlogPost[]`
  `BlogPost = { id; user_id; username; nickname; title; content; category; image_color; likes; created_at }` (링크 `/blog/${username}/${id}`)

## 작업 범위 (충돌 방지)
담당 서비스의 파일만 만들거나 수정한다:
- `src/app/<service>/**`, `src/app/api/<service>/**`, `src/components/<service>/**`, `src/lib/<service>.ts`(쿼리 모음), `src/lib/actions/<service>.ts`, `src/lib/seed/<service>.ts`.
- 공통 파일(`db.ts`, `schema.ts`, `auth.ts`, `components/common/*`, `globals.css`, `layout.tsx`, `page.tsx`)은 수정하지 않는다. 필요한 공통 변경은 최종 보고에 적는다.
- dev 서버는 이미 `http://127.0.0.1:3000`에서 실행 중(HMR). 새로 띄우지 말고 `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/<path>`로 렌더 확인, 에러는 `curl`로 본문 확인. 완료 전 `npx tsc --noEmit` 통과시킬 것(다른 서비스 파일 오류는 무시).
- `next build`는 실행하지 않는다(최종 통합 시 한 번 수행).
