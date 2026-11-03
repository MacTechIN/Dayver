import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CafeSiteShell } from "@/components/cafe/CafeSiteShell";
import { BoardTable } from "@/components/cafe/PostRows";
import { Pagination } from "@/components/cafe/Pagination";
import { loadCafeContext } from "@/components/cafe/context";
import { getBoard, getCafeBySlug, listCafePosts } from "@/lib/cafe";

type Props = { params: Promise<{ slug: string; boardId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, boardId } = await params;
  const cafe = getCafeBySlug(slug);
  const board = getBoard(Number(boardId));
  return { title: `${board?.name ?? "게시판"} - ${cafe?.name ?? "카페"} - DAYVER 카페` };
}

const SIZE = 20;

export default async function BoardPage({ params, searchParams }: Props) {
  const { slug, boardId } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const ctx = await loadCafeContext(slug);
  const { cafe, boards, role, user, pending } = ctx;
  const board = boards.find((b) => b.id === Number(boardId));
  if (!board) notFound();
  const locked = !!board.members_only && !role;
  const { posts, total } = locked ? { posts: [], total: 0 } : listCafePosts(cafe.id, { boardId: board.id, page, size: SIZE });
  return (
    <CafeSiteShell cafe={cafe} boards={boards} role={role} pendingRequest={pending} loggedIn={!!user} currentBoardId={board.id}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-bold">{board.name} <span className="text-dv-text-3 text-[13px] font-normal">{total}</span></h2>
        {role && <Link href={`/cafe/${cafe.slug}/write?board=${board.id}`} className="dv-btn-green px-4 py-2 text-[13px]" data-clk="cafe_board.write">글쓰기</Link>}
      </div>
      {locked ? (
        <p className="py-12 text-center text-dv-text-3">🔒 멤버 전용 게시판입니다. 카페에 가입하면 볼 수 있어요.</p>
      ) : (
        <>
          <BoardTable posts={posts} slug={cafe.slug} />
          <Pagination page={page} total={total} size={SIZE} hrefFor={(p) => `/cafe/${cafe.slug}/board/${board.id}?page=${p}`} />
        </>
      )}
    </CafeSiteShell>
  );
}
