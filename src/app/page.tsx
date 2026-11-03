import Link from "next/link";
import Script from "next/script";
import { getCurrentUser } from "@/lib/auth";
import { eagerData } from "@/lib/main";
import { get } from "@/lib/db";
import type { Block, ArticleMaterial, FeedMaterial, ProductMaterial } from "@/lib/main";
import { Footer } from "@/components/common/Footer";
import { LoginBox } from "@/components/common/LoginBox";
import { DayverLogo } from "@/components/common/DayverLogo";
import { SearchBox } from "@/components/main/SearchBox";
import { Shortcuts } from "@/components/main/Shortcuts";
import { Newsstand } from "@/components/main/Newsstand";
import { ShoppingBox } from "@/components/main/ShoppingBox";
import { FeedBlock } from "@/components/main/FeedBlock";
import { RightWidgets } from "@/components/main/RightWidgets";

export const dynamic = "force-dynamic";

/**
 * Dayver 메인 (www.naver.com 재해석)
 * 구조: 스킵링크 → 배너 → #header(로고·타임보드·검색·바로가기·우측 아이콘) → #container(좌 830 / 우 420) → #footer
 * 데이터: EAGER-DATA(동봉) + /api/lazy(지연). 뉴스스탠드/피드 탭 전환은 /api/lazy?blockCodeList=&target=
 */
export default async function Home() {
  const user = await getCurrentUser();
  const eager = eagerData();
  const notiCount = user ? get<{ c: number }>("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND read_at IS NULL", user.id)?.c ?? 0 : 0;
  const cartCount = user ? get<{ c: number }>("SELECT COALESCE(SUM(quantity),0) c FROM shop_cart_items WHERE user_id = ?", user.id)?.c ?? 0 : 0;
  const newsstand = eager["PC-MEDIA-WRAPPER"].blocks[0] as Block;
  const yonhap = eager["PC-NEWSSTAND-YONHAP"] as Block<ArticleMaterial>;
  const feed = eager["PC-FEED-WRAPPER"].blocks[0] as Block<FeedMaterial>;
  const shoppingBox = eager["PC-SHOPPING-BOX"] as Block<ProductMaterial>;
  const rightShopping = eager["PC-RIGHT-SHOPPING"] as Block<ProductMaterial>;
  const notices = eager["CAS-MINICONTENT-PC-NOTICE"].materials as Array<{ id: number; title: string }>;

  return (
    <>
      {/*
        네이버처럼 초기 블록 데이터를 window["EAGER-DATA"]로도 노출한다.
        React가 직접 렌더한 <script>는 클라이언트 네비게이션에서 실행되지 않으므로
        next/script(인라인 스크립트는 id 필수)를 쓴다.
      */}
      <Script
        id="eager-data"
        dangerouslySetInnerHTML={{ __html: `window["EAGER-DATA"]=window["EAGER-DATA"]||{};Object.assign(window["EAGER-DATA"],${JSON.stringify(eager).replace(/</g, "\\u003c")});` }}
      />
      <div id="u_skip">
        <a href="#header" className="dv-skip">상단영역 바로가기</a>
        <a href="#shortcutArea" className="dv-skip">서비스 메뉴 바로가기</a>
        <a href="#newsstand" className="dv-skip">새소식 블록 바로가기</a>
        <a href="#shopping" className="dv-skip">쇼핑 블록 바로가기</a>
        <a href="#feed" className="dv-skip">관심사 블록 바로가기</a>
        <a href="#my" className="dv-skip">MY 영역 바로가기</a>
        <a href="#widget" className="dv-skip">위젯 보드 바로가기</a>
        <a href="#footer" className="dv-skip">보기 설정 바로가기</a>
      </div>

      <aside id="dv-banner" aria-label="데이버 앱 설치 안내" className="bg-[#f7f9fa] border-b border-dv-border">
        <div className="dv-container h-10 flex items-center justify-center gap-3 text-[13px]">
          <span className="text-dv-red" aria-hidden>!</span>
          <span>더 빠른 검색, 더 편한 데이버 — 새 데이버 앱으로 시작하세요</span>
          <Link href="/me" className="px-3 py-1 rounded-full bg-black text-white text-[12px] font-bold">다운로드</Link>
          <span className="ml-auto flex items-center gap-3 text-dv-text-3 text-[12px]">
            <button type="button">7일 내 다시보지 않기</button>
            <button type="button" aria-label="배너 닫기">✕</button>
          </span>
        </div>
      </aside>

      <div id="wrap">
        <header id="header" role="banner" className="bg-white">
          <div id="topSearchWrap" className="dv-container relative pt-5 pb-5">
            <div className="absolute left-0 top-6 flex items-center gap-4">
              <button type="button" aria-label="확장 영역" className="w-9 h-9 grid place-items-center text-2xl text-dv-text-2">≡</button>
              <Link href="/shopping" id="topPayArea" aria-label="페이 바로가기" className="w-9 h-9 rounded-full border-2 border-dv-text-2 grid place-items-center text-[11px] font-black">pay</Link>
            </div>
            <div className="absolute right-0 top-6 flex items-center gap-4">
              <Link href="/me" id="topNotiArea" aria-label="알림" className="relative w-9 h-9 grid place-items-center text-xl">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15L6 17z"/><path d="M10 21h4"/></svg>{notiCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-dv-red text-white text-[10px] grid place-items-center px-1">{notiCount}</span>}
              </Link>
              <Link href="/shopping/cart" id="topShoppingArea" aria-label="장바구니 알림" className="relative w-9 h-9 grid place-items-center text-xl">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>{cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-dv-purple text-white text-[10px] grid place-items-center px-1">{cartCount}</span>}
              </Link>
            </div>
            <div className="w-[708px] mx-auto">
              <h1 id="special-logo" className="flex justify-center mb-4"><DayverLogo size={36} /></h1>
              <div id="search_area"><SearchBox /></div>
              <Shortcuts />
            </div>
            <Link href="/shopping/deals" id="timeboard-ex" aria-label="[광고] 데이세일 오늘 저녁 8시 LIVE" className="absolute right-0 top-[120px] w-[250px] h-[96px] rounded-xl overflow-hidden text-white p-3 flex flex-col justify-center" style={{ background: "linear-gradient(120deg,#0b3d91,#1e6fd9)" }}>
              <span className="absolute right-2 top-2 text-[10px] border border-white/60 rounded px-1">AD</span>
              <b className="text-[15px]">데이세일 ~72% 할인</b>
              <span className="text-[12px] opacity-90">오늘 저녁 8시 <b className="bg-dv-red px-1 rounded">LIVE</b></span>
            </Link>
          </div>
        </header>

        <div id="container" className="bg-dv-bg-2 border-t border-dv-border">
          <div className="dv-container grid grid-cols-[830px_420px] gap-[30px] pt-5 pb-10">
            <main id="root" role="main">
              <Link href="/shopping/deals" aria-label="광고 데이세일 특급 혜택" className="block h-[130px] rounded-xl overflow-hidden text-white relative" style={{ background: "linear-gradient(90deg,#0a2a6b,#1657c7)" }}>
                <span className="absolute left-7 top-7 text-[26px] font-black -rotate-3 inline-block">데이세일</span>
                <span className="absolute right-7 top-7 text-[20px] font-bold">~72% 할인, ~100만 D포인트 특급 혜택</span>
                <span className="absolute right-7 bottom-7 text-[14px]">오늘 저녁 8시 <b className="bg-dv-red px-1.5 rounded">LIVE</b></span>
              </Link>
              <div id="newsstand"><Newsstand initial={newsstand} yonhap={yonhap} /></div>
              <div id="shopping"><ShoppingBox block={shoppingBox} /></div>
              <div id="feed"><FeedBlock initial={feed} /></div>
            </main>
            <aside aria-label="MY 영역" className="min-w-0">
              <div id="my"><LoginBox next="/" /></div>
              <div id="widget"><RightWidgets rightShopping={rightShopping} loggedIn={!!user} /></div>
              {notices.length > 0 && (
                <section aria-label="공지사항" className="dv-card mt-3 p-4 text-[13px]">
                  <h3 className="font-bold mb-2">공지사항</h3>
                  <ul className="space-y-1 text-dv-text-2">{notices.map((n) => <li key={n.id} className="dv-ellipsis">{n.title}</li>)}</ul>
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
      <div id="footer"><Footer /></div>
    </>
  );
}
