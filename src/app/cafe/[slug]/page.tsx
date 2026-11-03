import type { Metadata } from "next";
import Link from "next/link";
import { CafeSiteShell } from "@/components/cafe/CafeSiteShell";
import { BoardTable } from "@/components/cafe/PostRows";
import { loadCafeContext } from "@/components/cafe/context";
import { getCafeBySlug, listCafePosts, listMembers } from "@/lib/cafe";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cafe = getCafeBySlug((await params).slug);
  return { title: `${cafe?.name ?? "카페"} - DAYVER 카페` };
}

export default async function CafeHome({ params }: Props) {
  const { slug } = await params;
  const ctx = await loadCafeContext(slug);
  const { cafe, boards, role, user, pending } = ctx;
  const notices = listCafePosts(cafe.id, { noticeOnly: true, size: 3 }).posts;
  const latest = listCafePosts(cafe.id, { size: 15 }).posts.filter((p) => !p.is_notice);
  const members = listMembers(cafe.id).slice(0, 8);
  return (
    <CafeSiteShell cafe={cafe} boards={boards} role={role} pendingRequest={pending} loggedIn={!!user} currentBoardId="home">
      <section aria-label="공지" className="mb-6">
        <h2 className="text-[16px] font-bold mb-2">공지</h2>
        <ul className="dv-card divide-y divide-dv-border-2 text-[14px]">
          {notices.map((p) => (
            <li key={p.id} className="px-4 py-2.5 flex gap-3">
              <b className="text-dv-red shrink-0">공지</b>
              <Link href={`/cafe/${cafe.slug}/post/${p.id}`} className="dv-ellipsis hover:underline" data-clk="cafe_home.notice">{p.title}</Link>
              <time className="ml-auto text-[12px] text-dv-text-3 shrink-0">{p.created_at.slice(0, 10)}</time>
            </li>
          ))}
          {notices.length === 0 && <li className="px-4 py-3 text-dv-text-3">등록된 공지가 없습니다.</li>}
        </ul>
      </section>
      <section aria-label="최신글" className="mb-6">
        <h2 className="flex items-center justify-between text-[16px] font-bold mb-2">
          <span>최신글</span>
          {role && <Link href={`/cafe/${cafe.slug}/write`} className="text-[13px] font-normal text-dv-green">글쓰기 ›</Link>}
        </h2>
        <BoardTable posts={latest} slug={cafe.slug} clk="cafe_home.latest" />
      </section>
      <section aria-label="멤버" className="dv-card p-4">
        <h2 className="flex items-center justify-between text-[14px] font-bold mb-3">
          <span>활동 멤버</span>
          <Link href={`/cafe/${cafe.slug}/members`} className="text-[12px] font-normal text-dv-text-2">전체 보기 ›</Link>
        </h2>
        <ul className="flex flex-wrap gap-3">
          {members.map((m) => (
            <li key={m.user_id} className="flex items-center gap-1.5 text-[12px]">
              <span className="w-6 h-6 rounded-full text-white grid place-items-center text-[11px] font-bold" style={{ background: m.avatar_color }} aria-hidden>{m.nickname.slice(0, 1)}</span>
              {m.nickname}
              {m.role !== "member" && <span className="text-dv-text-3">({m.role === "owner" ? "매니저" : "스태프"})</span>}
            </li>
          ))}
        </ul>
      </section>
    </CafeSiteShell>
  );
}
