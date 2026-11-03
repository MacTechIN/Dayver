import Link from "next/link";
import { TopBar } from "@/components/common/TopBar";
import { Footer } from "@/components/common/Footer";
import type { Cafe, CafeBoard } from "@/lib/cafe";
import { canManage } from "@/lib/cafe";
import { CafeAvatar } from "./CafeCard";
import { joinCafeAction, leaveCafeAction } from "@/lib/actions/cafe";
import { CAFE_SERVICE_COLOR } from "./constants";

/**
 * 개별 카페 화면 셸: 상단 바 → 커버(색상, 카페명, 멤버 수, 가입 버튼) → 좌측 카페 메뉴(게시판) | 본문
 */
export function CafeSiteShell({
  cafe,
  boards,
  role,
  pendingRequest,
  loggedIn,
  currentBoardId,
  children,
}: {
  cafe: Cafe;
  boards: CafeBoard[];
  role?: "owner" | "staff" | "member";
  pendingRequest?: boolean;
  loggedIn: boolean;
  currentBoardId?: number | "home" | "members" | "manage";
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <TopBar service="Cafe" serviceHref="/cafe" serviceColor={CAFE_SERVICE_COLOR} />
      <header className="relative text-white" style={{ background: `linear-gradient(120deg, ${cafe.color}, #1f2937)` }}>
        <div className="dv-container h-[150px] flex items-end justify-between pb-6">
          <div className="flex items-center gap-4">
            <CafeAvatar cafe={cafe} size={64} />
            <div>
              <h1 className="text-[26px] font-black leading-tight">
                <Link href={`/cafe/${cafe.slug}`}>{cafe.name}</Link>
                {!cafe.is_public && <span className="ml-2 text-[13px] font-normal opacity-80">🔒 비공개 카페</span>}
              </h1>
              <p className="text-[13px] opacity-90 mt-1">{cafe.description}</p>
              <p className="text-[12px] opacity-80 mt-1">
                {cafe.category}{cafe.region ? ` · ${cafe.region}` : ""} · 멤버 {cafe.member_count.toLocaleString()} · 글 {cafe.post_count.toLocaleString()} · 개설 {cafe.created_at.slice(0, 10)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {role ? (
              <>
                <span className="text-[12px] bg-white/20 rounded-full px-3 py-1">{role === "owner" ? "매니저" : role === "staff" ? "스태프" : "멤버"}</span>
                {canManage(role) && <Link href={`/cafe/${cafe.slug}/manage`} className="bg-white text-dv-text rounded-full px-4 py-2 text-[13px] font-bold" data-clk="cafe_cover.manage">카페 관리</Link>}
                <Link href={`/cafe/${cafe.slug}/write`} className="dv-btn-green rounded-full px-4 py-2 text-[13px]" data-clk="cafe_cover.write">글쓰기</Link>
                {role !== "owner" && (
                  <form action={leaveCafeAction}>
                    <input type="hidden" name="slug" value={cafe.slug} />
                    <button type="submit" className="text-[12px] underline opacity-80">탈퇴</button>
                  </form>
                )}
              </>
            ) : pendingRequest ? (
              <span className="bg-white/20 rounded-full px-4 py-2 text-[13px]">가입 승인 대기 중</span>
            ) : loggedIn ? (
              <form action={joinCafeAction} className="flex items-center gap-2">
                <input type="hidden" name="slug" value={cafe.slug} />
                {!cafe.is_public && <input name="message" placeholder="가입 인사" className="rounded-full px-3 py-2 text-[13px] text-dv-text w-48" />}
                <button type="submit" className="dv-btn-green rounded-full px-5 py-2 text-[14px]" data-clk="cafe_cover.join">{cafe.is_public ? "카페 가입하기" : "가입 신청"}</button>
              </form>
            ) : (
              <Link href={`/login?next=${encodeURIComponent(`/cafe/${cafe.slug}`)}`} className="dv-btn-green rounded-full px-5 py-2 text-[14px]" data-clk="cafe_cover.join">카페 가입하기</Link>
            )}
          </div>
        </div>
      </header>
      <div className="dv-container flex gap-8 py-6">
        <nav aria-label="카페 메뉴" className="w-[200px] shrink-0">
          <ul className="space-y-0.5 text-[14px]">
            <li><Link href={`/cafe/${cafe.slug}`} aria-current={currentBoardId === "home" ? "page" : undefined} className={`block px-3 py-2 rounded ${currentBoardId === "home" ? "bg-dv-bg-2 font-bold" : "hover:bg-dv-bg-2"}`}>카페 홈</Link></li>
            <li><Link href={`/cafe/${cafe.slug}/members`} aria-current={currentBoardId === "members" ? "page" : undefined} className={`block px-3 py-2 rounded ${currentBoardId === "members" ? "bg-dv-bg-2 font-bold" : "hover:bg-dv-bg-2"}`}>멤버 <span className="text-dv-text-3">{cafe.member_count}</span></Link></li>
          </ul>
          <h2 className="mt-4 mb-1 px-3 text-[12px] font-bold text-dv-text-3">게시판</h2>
          <ul className="space-y-0.5 text-[14px]">
            {boards.map((b) => (
              <li key={b.id}>
                <Link href={`/cafe/${cafe.slug}/board/${b.id}`} data-clk="cafe_menu.board" aria-current={currentBoardId === b.id ? "page" : undefined} className={`flex justify-between px-3 py-2 rounded ${currentBoardId === b.id ? "bg-dv-bg-2 font-bold text-dv-green" : "hover:bg-dv-bg-2"}`}>
                  <span>{b.members_only ? "🔒 " : ""}{b.name}</span>
                  <span className="text-dv-text-3 text-[12px]">{b.post_count}</span>
                </Link>
              </li>
            ))}
          </ul>
          {canManage(role) && (
            <Link href={`/cafe/${cafe.slug}/manage`} className={`mt-4 block px-3 py-2 rounded text-[13px] ${currentBoardId === "manage" ? "bg-dv-bg-2 font-bold" : "text-dv-text-2 hover:bg-dv-bg-2"}`}>⚙ 카페 관리</Link>
          )}
        </nav>
        <main id="content" className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer compact />
    </>
  );
}
